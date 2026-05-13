import json
import os
from datetime import datetime, timedelta, UTC
from functools import wraps

import jwt
import requests
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS


# def get_secret_from_vault():
#     url = "http://localhost:8200/v1/secret/data/devsecops"
#     headers = {"X-Vault-Token": "VAULT_TOKEN"}  # for demo only

#     response = requests.get(url, headers=headers)
#     data = response.json()

#     return data["data"]["data"]["SECRET_KEY"]

def get_secret_from_vault():
    try:
        url = "http://vault:8200/v1/secret/data/devsecops"
        headers = {"X-Vault-Token": os.getenv("VAULT_TOKEN")}

        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()

        return data.get("data", {}).get("data", {}).get("SECRET_KEY")
    except Exception as exc:
        print("Vault error:", exc)
        return None


def get_jwt_secret():
    """Resolve JWT secret from env, Vault, then fallback."""
    env_secret = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY")
    if env_secret:
        return env_secret

    vault_secret = get_secret_from_vault()
    if vault_secret:
        return vault_secret

    return "fallback-secret"

SECRET_KEY = get_jwt_secret()

# Temporary in-memory notes storage (no database).
NOTES = [
    {"id": 1, "title": "Zero Trust kickoff", "content": "Baseline roadmap drafted."},
    {"id": 2, "title": "Pipeline hardening", "content": "Add signature validation."}
]
NEXT_NOTE_ID = 3

APP_DIR = os.path.dirname(__file__)
STATIC_DIR = os.path.join(APP_DIR, "static")
REPORTS_DIR = os.path.abspath(os.path.join(APP_DIR, ".."))


app = Flask(__name__, static_folder="static", static_url_path="/")
# Allow the isolated frontend to call this API during local development.
CORS(app)

# def token_required(f):
#     @wraps(f)
#     def decorated(*args, **kwargs):
#         token = request.headers.get("Authorization")

#         if not token:
#             return jsonify({"message": "Token missing"}), 403

#         try:
#             jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
#         except:
#             return jsonify({"message": "Invalid token"}), 403

#         return f(*args, **kwargs)

#     return decorated

def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        # Expect Authorization: Bearer <token>
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"message": "Bearer token required"}), 401

        token = auth_header.split(" ", 1)[1].strip()
        if not token:
            return jsonify({"message": "Token missing"}), 401

        try:
            jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorator


def next_note_id():
    """Generate a new note id for in-memory storage."""
    global NEXT_NOTE_ID
    note_id = NEXT_NOTE_ID
    NEXT_NOTE_ID += 1
    return note_id


def load_json_report(filename):
    """Load a JSON report from disk; return (data, error_message)."""
    path = os.path.join(REPORTS_DIR, filename)
    if not os.path.exists(path):
        return None, f"Report file missing: {filename}"

    try:
        with open(path, "r", encoding="utf-8") as handle:
            return json.load(handle), None
    except json.JSONDecodeError:
        return None, f"Report file invalid JSON: {filename}"
    except OSError as exc:
        return None, f"Report file read error: {exc}"


def summarize_trivy(report):
    """Extract vulnerability counts, CVEs, and packages from a Trivy report."""
    counts = {"critical": 0, "high": 0, "medium": 0, "low": 0}
    cves = set()
    packages = set()

    for result in report.get("Results", []):
        for vuln in result.get("Vulnerabilities", []) or []:
            severity = (vuln.get("Severity") or "").lower()
            if severity in counts:
                counts[severity] += 1

            vuln_id = vuln.get("VulnerabilityID")
            if vuln_id:
                cves.add(vuln_id)

            pkg_name = vuln.get("PkgName")
            if pkg_name:
                packages.add(pkg_name)

    return {
        "summary": counts,
        "cves": sorted(cves),
        "packages": sorted(packages)
    }


def summarize_gitleaks(report):
    """Extract secrets count, files, rule IDs, and severity info from Gitleaks."""
    secrets = report if isinstance(report, list) else report.get("findings", [])
    files = set()
    rules = set()
    severity_counts = {}

    for finding in secrets:
        file_name = finding.get("File") or finding.get("file")
        if file_name:
            files.add(file_name)

        rule_id = finding.get("RuleID") or finding.get("rule_id")
        if rule_id:
            rules.add(rule_id)

        severity = (finding.get("Severity") or finding.get("severity") or "unknown").lower()
        severity_counts[severity] = severity_counts.get(severity, 0) + 1

    return {
        "summary": {
            "detected": len(secrets)
        },
        "files": sorted(files),
        "rule_ids": sorted(rules),
        "severity": severity_counts
    }

@app.route("/")
def home():
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return send_from_directory(STATIC_DIR, "index.html")
    return "Frontend build missing", 404


@app.route("/secure")
@token_required
def secure_home():
    return jsonify({"message": "Secure endpoint access granted"})

@app.route("/health")
def health():
    return jsonify({"status": "healthy"})


@app.route("/api/health")
def api_health():
    return jsonify({"status": "ok"})

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Username and password required"}), 400

    if username != "admin" or password != "admin123":
        return jsonify({"message": "Unauthorized"}), 401

    # Issue a short-lived JWT token for the client.
    token = jwt.encode(
        {
            "user": username,
            "exp": datetime.now(UTC) + timedelta(hours=1),
            "iat": datetime.now(UTC)
        },
        SECRET_KEY,
        algorithm="HS256"
    )

    return jsonify({"token": token})


@app.route("/notes", methods=["GET"])
@token_required
def list_notes():
    return jsonify({"notes": NOTES})


@app.route("/notes", methods=["POST"])
@token_required
def create_note():
    data = request.get_json(silent=True) or {}
    title = data.get("title")
    content = data.get("content")

    if not title or not content:
        return jsonify({"message": "Title and content required"}), 400

    note = {
        "id": next_note_id(),
        "title": str(title),
        "content": str(content)
    }
    NOTES.append(note)

    return jsonify({"note": note}), 201


@app.route("/notes/<int:note_id>", methods=["DELETE"])
@token_required
def delete_note(note_id):
    for index, note in enumerate(NOTES):
        if note["id"] == note_id:
            deleted = NOTES.pop(index)
            return jsonify({"deleted": deleted})

    return jsonify({"message": "Note not found"}), 404


@app.route("/security/trivy", methods=["GET"])
def trivy_report():
    report, error = load_json_report("trivy-report.json")
    if error:
        return jsonify({
            "available": False,
            "message": error,
            "summary": {"critical": 0, "high": 0, "medium": 0, "low": 0},
            "cves": [],
            "packages": []
        }), 200

    try:
        payload = summarize_trivy(report)
        return jsonify({"available": True, **payload})
    except Exception as exc:
        return jsonify({"message": f"Failed to parse Trivy report: {exc}"}), 500


@app.route("/security/gitleaks", methods=["GET"])
def gitleaks_report():
    report, error = load_json_report("gitleaks-report.json")
    if error:
        return jsonify({
            "available": False,
            "message": error,
            "summary": {"detected": 0},
            "files": [],
            "rule_ids": [],
            "severity": {}
        }), 200

    try:
        payload = summarize_gitleaks(report)
        return jsonify({"available": True, **payload})
    except Exception as exc:
        return jsonify({"message": f"Failed to parse Gitleaks report: {exc}"}), 500


@app.route("/<path:subpath>")
def spa_fallback(subpath):
    file_path = os.path.join(STATIC_DIR, subpath)
    if os.path.isfile(file_path):
        return send_from_directory(STATIC_DIR, subpath)
    return send_from_directory(STATIC_DIR, "index.html")



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)


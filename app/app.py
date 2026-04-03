import jwt
import datetime
import os
import requests
from flask import Flask, request, jsonify
from functools import wraps
from datetime import datetime, timedelta, UTC


# def get_secret_from_vault():
#     url = "http://localhost:8200/v1/secret/data/devsecops"
#     headers = {"X-Vault-Token": "VAULT_TOKEN"}  # for demo only

#     response = requests.get(url, headers=headers)
#     data = response.json()

#     return data["data"]["data"]["SECRET_KEY"]

def get_secret_from_vault():
    url = "http://localhost:8200/v1/secret/data/devsecops"
    headers = {"X-Vault-Token": os.getenv("VAULT_TOKEN")}

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        raise Exception(f"Vault error: {response.text}")

    data = response.json()

    if "data" not in data:
        raise Exception(f"Unexpected response: {data}")

    return data["data"]["data"]["SECRET_KEY"]

SECRET_KEY = get_secret_from_vault()

app = Flask(__name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"message": "Token missing"}), 403

        try:
            jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except:
            return jsonify({"message": "Invalid token"}), 403

        return f(*args, **kwargs)

    return decorated

@app.route("/")
@token_required
def home():
    return "Secure DevSecOps App Running 🔐"

@app.route("/health")
def health():
    return jsonify({"status": "healthy"})

@app.route("/login", methods=["POST"])
def login():
    data = request.json

    if data.get("username") == "admin":
        token = jwt.encode({
            "user": "admin",
            "exp":  datetime.now(UTC) + timedelta(minutes=30)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({"token": token})

    return jsonify({"message": "Unauthorized"}), 401



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)


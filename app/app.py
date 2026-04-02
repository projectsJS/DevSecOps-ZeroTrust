from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/")
def home():
    return "DevSecOps Zero Trust App Running 🚀"

@app.route("/health")
def health():
    return jsonify({"status": "healthy"})

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    if data.get("username") == "admin":
        return jsonify({"message": "Login success"})
    return jsonify({"message": "Unauthorized"}), 401

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
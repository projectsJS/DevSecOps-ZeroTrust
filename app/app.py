from flask import Flask, request, jsonify

app = Flask(__name__)

PRIVATE_KEY = """-----BEGIN RSA PRIVATE KEY-----
MIIBOgIBAAJBAKj34GkxFhD90vcNLYLInFEX6Ppy1tPf9Cnzj4p4WGeKLs1Pt8Qu
KUpRKfFLfRYC9AIKjbJTWit+CqvjWYzvQwECAwEAAQJAIJLixBy2qpFoS4DSmoEm
o3qGy0t6z09AIJtH+5OeRV1be+N4cDYJKffGzDa88vQENZiRm0GRq6a+HPGQMd2k
TQIhAKMSvzIBnni7ot/OSie2TmJLY4SwTQAevXysE2RbFDYdAiEBCUEaRQnMnbp7
9mxDXDf6AU0cN/RPBjb9qSHDcWZHGzUCIG2Es59z8ugGrDY+pxLQnwfotadxd+Uy
v/Ow5T0q5gIJAiEAyS4RaI9YG8EWx/2w0T67ZUVAw8eOMB6BIUg0Xcu+3okCIBOs
/5OiPgoTdSy7bcF9IGpSE8ZgGKzgYQVZeN97YE00
-----END RSA PRIVATE KEY-----"""

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


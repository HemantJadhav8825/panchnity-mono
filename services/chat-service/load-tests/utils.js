const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY || "dev_secret_key_123";

// Handle potentially escaped newlines in env var
const STATUS_PRIVATE_KEY = JWT_PRIVATE_KEY.replace(/\\n/g, "\n");

function generateTestToken(userId = "test-user", email = "test@example.com") {
  const payload = {
    sub: userId,
    email: email,
    type: "access",
  };

  // Determine algorithm based on key format
  const algorithm = STATUS_PRIVATE_KEY.includes("PRIVATE KEY")
    ? "RS256"
    : "HS256";

  return jwt.sign(payload, STATUS_PRIVATE_KEY, {
    algorithm,
    expiresIn: "1h",
    issuer: "panchnity-auth",
  });
}

module.exports = { generateTestToken };

const jwt = require("jsonwebtoken");
const saltRounds = process.env.SALT_ROUNDS || 10;
const jwtSignKey = process.env.JWT_SIGN_KEY || "default_secret_key";

async function checkAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ success: false, message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).send({ success: false, message: "Token missing" });
    }

    try {
        const decoded = jwt.verify(token, jwtSignKey);
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(403).send({ success: false, message: "Invalid or expired token" });
    }
}

module.exports = { checkAuth };
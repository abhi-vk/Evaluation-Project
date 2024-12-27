const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(403).json({ status: "error", msg: "Authorization header missing or malformed" });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(403).json({ status: "error", msg: "Token not found" });
        }

        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.uid; // User ID from token
        req.activeWorkspaceId = data.activeWorkspaceId; // Active Workspace ID from token
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ status: "error", msg: "Invalid token" });
        }
        next(err); // Handle other errors
    }
};

module.exports = verifyToken;

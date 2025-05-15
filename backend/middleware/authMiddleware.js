const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Không có token xác thực!' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Xác thực thất bại!' });
    }
};

module.exports = authMiddleware;
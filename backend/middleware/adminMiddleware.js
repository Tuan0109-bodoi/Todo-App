const adminMiddleware = (req, res, next) => {
    // Nếu không có userData hoặc không phải admin thì từ chối
    if (!req.userData || req.userData.role !== 'admin') {
        return res.status(403).json({ error: 'Không có quyền truy cập' });
    }
    
    next();
};

module.exports = adminMiddleware;
// giả lập middleware xác thực người dùng
const authMiddleware = (req, res, next) => {
    req.user = {
        id: 2 
    };
    next();
};

module.exports = authMiddleware;
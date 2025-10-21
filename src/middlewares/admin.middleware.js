const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError(403, 'Access denied: Admin only'));
    }
    next();
};
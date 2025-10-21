const { verifyAccessToken } = require('../utils/jwt.util');
const AppError = require('../utils/AppError');

module.exports = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return next(new AppError(401, 'No token provided'));
    }

    try {
        req.user = await verifyAccessToken(token);
        next();
    } catch (err) {
        next(new AppError(401, 'Invalid token'));
    }
};
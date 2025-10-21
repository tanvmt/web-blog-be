const AppError = require('../utils/AppError');

module.exports = (schema) => (req, res, next) => {
    const { error } = schema.safeParse(req.body);
    if (error) {
        return next(new AppError(400, 'Validation error: ' + error.errors[0].message));
    }
    next();
};
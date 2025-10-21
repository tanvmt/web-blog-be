
const {BadRequestError} = require("../utils/AppError");

module.exports = (schema) => (req, res, next) => {
    const { error } = schema.safeParse(req.body);
    if (error) {
        console.log(error.issues?.[0]?.message)
        return next(new BadRequestError('Validation error: ' + error.issues?.[0]?.message));
    }
    next();
};
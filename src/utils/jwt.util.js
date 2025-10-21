const jwt = require('jsonwebtoken');
const { redisClient } = require('../config/redis.config');
const AppError = require('./AppError');
const logger = require('./logger');

const accessSecret = process.env.JWT_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
const accessExpire = process.env.ACCESS_TOKEN_EXPIRES_IN;
const refreshExpire = process.env.REFRESH_TOKEN_EXPIRES_IN;

const generateRefreshToken = async (user) => {
    const refreshToken = jwt.sign(
        { id: user.id },
        refreshSecret,
        { expiresIn: refreshExpire }
    );

    const refreshKey = `${user.id}:refresh:${refreshToken}`;
    await redisClient.set(refreshKey, 'valid', 'EX', 60 * 60 * 24 * 7);

    logger.info(`Tokens generated for user ${user.id}`);
    return { refreshToken };
};

const generateAccessToken = async (user) => {
    const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        accessSecret,
        { expiresIn: accessExpire }
    );
    return { accessToken };
};

const verifyRefreshToken = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, refreshSecret);
        const refreshKey = `${decoded.id}:refresh:${refreshToken}`;
        const isValid = await redisClient.get(refreshKey);
        if (!isValid) {
            throw new AppError(401, 'Invalid or expired refresh token');
        }
        return decoded;
    } catch (err) {
        throw new AppError(401, 'Invalid refresh token');
    }
};

const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token,accessSecret );
    } catch (err) {
        throw new AppError(401, 'Invalid token');
    }
};

module.exports = {
    generateRefreshToken,
    generateAccessToken,
    verifyRefreshToken,
    verifyAccessToken,
};
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const { redisClient } = require('../config/redis.config');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { generateAccessToken,generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.util');


const register = async ({ name, email, password }) => {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
        throw new AppError(409, 'Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.create({ name, email, password: hashedPassword, isVerified: false });

    await sendVerificationOtp(user.id, user.email);

    logger.info(`User registered (unverified): ${user.id}`);
    return user;
};

const login = async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
        throw new AppError(401, 'Invalid credentials');
    }

    if (!user.isVerified) {
        throw new AppError(403, 'Email not verified. Please verify your email first.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError(401, 'Invalid credentials');
    }

    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    logger.info(`User logged in: ${user.id}`);
    return { user: user, accessToken, refreshToken };
};

const refreshToken = async (refreshToken) => {
    try {
        const decode = await verifyRefreshToken(refreshToken)
        const user = await userRepository.findById(decode.id);
        if (!user) {
            throw new AppError(401, 'Invalid refresh token');
        }
        const accessToken = await generateAccessToken(user);
        return { accessToken };
    } catch (err) {
        throw new AppError(401, 'Invalid refresh token');
    }
};

const getProfile = async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) {
        throw new AppError(404, 'User not found');
    }
    return user;
};

const logout = async (userId, accessToken) => {
    const keys = await redisClient.keys(`${userId}:refresh:*`);
    if (keys.length > 0) {
        await redisClient.del(...keys);
    }
    logger.info(`User logged out: ${userId}`);
};

const requestOtpForChangePassword = async (userId, email) => {
    const user = await userRepository.findById(userId);
    if (!user || user.email !== email) {
        throw new AppError(400, 'Invalid email');
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `${userId}:otp`;
    await redisClient.set(otpKey, otp, 'EX', parseInt(process.env.OTP_EXPIRES_IN) * 60); // e.g., 5m

    logger.info(`OTP generated for user ${userId}: ${otp}`);
};

const changePassword = async (userId, { otp, newPassword }) => {
    const otpKey = `${userId}:otp`;
    const storedOtp = await redisClient.get(otpKey);
    if (!storedOtp || storedOtp !== otp) {
        throw new AppError(400, 'Invalid or expired OTP');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await userRepository.updatePassword(userId, hashedPassword);

    await redisClient.del(otpKey);
    logger.info(`Password changed for user ${userId}`);
    return user;
};

const verifyEmail = async ({ email, otp }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
        throw new AppError(404, 'User not found');
    }
    if (user.isVerified) {
        throw new AppError(400, 'Email already verified');
    }

    const otpKey = `${user.id}:verificationOtp`;
    const storedOtp = await redisClient.get(otpKey);
    if (!storedOtp || storedOtp !== otp) {
        throw new AppError(400, 'Invalid or expired OTP');
    }

    const updatedUser = await userRepository.updateVerification(user.id, true);
    await redisClient.del(otpKey);

    logger.info(`Email verified for user ${user.id}`);
    return updatedUser;
};

const resendVerificationOtp = async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) {
        throw new AppError(404, 'User not found');
    }
    if (user.isVerified) {
        throw new AppError(400, 'Email already verified');
    }

    await sendVerificationOtp(user.id, user.email);
    logger.info(`Verification OTP resent for user ${user.id}`);
};

const sendVerificationOtp = async (userId, email) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpKey = `${userId}:verificationOtp`;
    await redisClient.set(otpKey, otp, 'EX', parseInt(process.env.OTP_EXPIRES_IN) * 60);  // e.g., 5m

    // Send email
    const subject = 'Verify Your Email';
    const text = `Your OTP for email verification is: ${otp}. It expires in ${process.env.OTP_EXPIRES_IN} minutes.`;
    await sendEmail(email, subject, text);

    logger.info(`Verification OTP sent to ${email}`);
};

const listUsers = async () => {
    return await userRepository.findAll();
};
module.exports = {
    register,
    login,
    refreshToken,
    getProfile,
    logout,
    requestOtpForChangePassword,
    changePassword,
    verifyEmail,
    resendVerificationOtp,
    listUsers,
};
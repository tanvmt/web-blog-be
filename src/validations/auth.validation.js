const z = require('zod');

const register = z.object({
    name: z.string().min(1),
    email: z.email(),
    password: z.string().min(8),
});

const login = z.object({
    email: z.email(),
    password: z.string().min(8),
});

const refreshToken = z.object({
    refreshToken: z.string(),
});

const requestOtp = z.object({
    email: z.email(),
});

const changePassword = z.object({
    otp: z.string().length(6),
    newPassword: z.string().min(8),
});

const verifyEmail = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
});

const resendOtp = z.object({});

module.exports = {
    register,
    login,
    refreshToken,
    requestOtp,
    changePassword,
    verifyEmail,
    resendOtp,
};
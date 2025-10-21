const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const UserDTO = require('../dtos/auth.dto');

const register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        const userDto = UserDTO.fromEntity(user);
        res.status(201).json(new ApiResponse(true, 'User registered successfully', {user: userDto}));
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { user, accessToken, refreshToken } = await authService.login(req.body);
        const userDto = UserDTO.fromEntity(user);
        res.status(200).json(new ApiResponse(true, 'Login successful', { user: userDto, accessToken, refreshToken }));
    } catch (error) {
        next(error);
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const { accessToken } = await authService.refreshToken(req.body.refreshToken);
        res.status(200).json(new ApiResponse(true, 'Token refreshed', { accessToken }));
    } catch (error) {
        next(error);
    }
};

const getProfile = async (req, res, next) => {
    try {
        const user = await authService.getProfile(req.user.id);
        const userDto = UserDTO.fromEntity(user);
        res.status(200).json(new ApiResponse(true, 'Profile fetched', {user: userDto}));
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        await authService.logout(req.user.id);
        res.status(200).json(new ApiResponse(true, 'Logged out successfully'));
    } catch (error) {
        next(error);
    }
};

const sendOtpChangePassword = async (req, res, next) => {
    try {
        await authService.sendOtp(req.body.email, "reset");
        res.status(200).json(new ApiResponse(true, 'OTP change password sent (simulated)'));
    } catch (error) {
        next(error);
    }
};
const sendOtpVerifyEmail = async (req, res, next) => {
    try {
        await authService.sendOtp(req.body.email, "register");
        res.status(200).json(new ApiResponse(true, 'OTP verify email sent (simulated)'));
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        await authService.changePassword(req.body.email, req.body.otp, req.body.newPassword);
        res.status(200).json(new ApiResponse(true, 'Password changed successfully'));
    } catch (error) {
        next(error);
    }
};
const verifyOtpChangePassword = async (req, res, next) => {
    try {
        await authService.verifyOtp(req.body.email, req.body.otp, "reset");
        res.status(200).json(new ApiResponse(true, 'OTP verified successfully', null));
    } catch (error) {
        next(error);
    }
}

const verifyOtpRegister = async (req, res, next) => {
    try {
        await authService.verifyOtp(req.body.email, req.body.otp, "register");
        res.status(200).json(new ApiResponse(true, 'OTP verified successfully'));
    } catch (error) {
        next(error);
    }
}

const listUsers = async (req, res, next) => {
    try {
        const users = await authService.listUsers();
        const usersDto = users.map(user => UserDTO.fromEntity(user));
        res.status(200).json(new ApiResponse(true, 'Users listed', {users: usersDto}));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    verifyOtpRegister,
    verifyOtpChangePassword,
    sendOtpChangePassword,
    sendOtpVerifyEmail,
    changePassword,
    getProfile,
    listUsers,
};
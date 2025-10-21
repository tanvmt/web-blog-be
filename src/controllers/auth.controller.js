const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const UserDTO = require('../dtos/auth.dto');

const register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        const userDto = UserDTO.fromEntity(user);
        res.status(201).json(new ApiResponse(true, 'User registered successfully', userDto));
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { user, accessToken, refreshToken } = await authService.login(req.body);
        const userDto = UserDTO.fromEntity(user);
        res.status(200).json(new ApiResponse(true, 'Login successful', { userDto, accessToken, refreshToken }));
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
        res.status(200).json(new ApiResponse(true, 'Profile fetched', userDto));
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        await authService.logout(req.user.id, req.headers.authorization.split(' ')[1]);
        res.status(200).json(new ApiResponse(true, 'Logged out successfully', null));
    } catch (error) {
        next(error);
    }
};

const requestOtpForChangePassword = async (req, res, next) => {
    try {
        await authService.requestOtpForChangePassword(req.user.id, req.body.email);
        res.status(200).json(new ApiResponse(true, 'OTP sent (simulated)', null));
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const user = await authService.changePassword(req.user.id, req.body);
        const userDto = UserDTO.fromEntity(user);
        res.status(200).json(new ApiResponse(true, 'Password changed successfully', userDto));
    } catch (error) {
        next(error);
    }
};

const verifyEmail = async (req, res, next) => {
    try {
        const user = await authService.verifyEmail(req.body);
        const userDto = UserDTO.fromEntity(user);
        res.status(200).json(new ApiResponse(true, 'Email verified successfully', userDto));
    } catch (error) {
        next(error);
    }
};

const resendVerificationOtp = async (req, res, next) => {
    try {
        await authService.resendVerificationOtp(req.user.id);
        res.status(200).json(new ApiResponse(true, 'Verification OTP resent', null));
    } catch (error) {
        next(error);
    }
};

const listUsers = async (req, res, next) => {
    try {
        const users = await authService.listUsers();
        const usersDto = users.map(user => UserDTO.fromEntity(user));
        res.status(200).json(new ApiResponse(true, 'Users listed', usersDto));
    } catch (error) {
        next(error);
    }
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
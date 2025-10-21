const express = require('express');
const authController = require('../controllers/auth.controller');
const validateMiddleware = require('../middlewares/validate.middleware');
const authMiddleware = require('../middlewares/auth.middleware');
const authValidation = require('../validations/auth.validation');
const adminMiddleware = require('../middlewares/admin.middleware');

const router = express.Router();

router.post('/register', validateMiddleware(authValidation.register), authController.register);
router.post('/verify-email', validateMiddleware(authValidation.verifyEmail), authController.verifyEmail);
router.post('/resend-verification-otp', authMiddleware, validateMiddleware(authValidation.resendOtp), authController.resendVerificationOtp);
router.post('/login', validateMiddleware(authValidation.login), authController.login);
router.post('/refresh-token', validateMiddleware(authValidation.refreshToken), authController.refreshToken);
router.get('/profile', authMiddleware, authController.getProfile);
router.post('/logout', authMiddleware, authController.logout);
router.post('/change-password/request-otp', authMiddleware, validateMiddleware(authValidation.requestOtp), authController.requestOtpForChangePassword);
router.post('/change-password', authMiddleware, validateMiddleware(authValidation.changePassword), authController.changePassword);

// Ví dụ route admin-only: List all users
router.get('/admin/users', authMiddleware, adminMiddleware, authController.listUsers);

module.exports = router;
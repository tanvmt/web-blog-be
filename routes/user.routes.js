const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// API Tạm thời cho Login.jsx
// GET /api/v1/users/:id
router.get('/:id', userController.getUserByIdForLogin);

// (Sau này Người 1 & 2 sẽ thêm các route khác vào đây)
// router.post('/:id/follow', authMiddleware, userController.followUser);

module.exports = router;
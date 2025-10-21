const express = require('express');
const router = express.Router();

// const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const articleRoutes = require('./article.routes');
// const commentRoutes = require('./comment.routes');
// ... thêm các routes khác ở đây

// Gắn các routes con vào router chính
// router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);
// router.use('/comments', commentRoutes);
router.use('/users', userRoutes);

module.exports = router;
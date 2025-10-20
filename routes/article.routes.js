const express = require('express');
const router = express.Router();
const articleController = require('../controllers/article.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, articleController.createArticle);
router.get('/', articleController.getAllArticles);
router.get('/:slug', articleController.getArticleBySlug);

// U11: Cập nhật bài viết (bạn sẽ tự làm)
// router.put('/:articleId', authMiddleware, articleController.updateArticle);

// U11: Xóa bài viết (bạn sẽ tự làm)
// router.delete('/:articleId', authMiddleware, articleController.deleteArticle);

module.exports = router;
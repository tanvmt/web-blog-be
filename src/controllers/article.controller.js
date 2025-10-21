const ApiResponse = require('../utils/ApiResponse');
const articleService = require('../services/article.service');
const {
    ArticleDetailDTO,
    ArticleSummaryDTO,
} = require('../dtos/article.dto');

const createArticle = async (req, res, next) => {
  try {
    const article = await articleService.createArticle(
      req.body,
      req.user.id,
      req.file
    );
    const articleDTO = new ArticleDetailDTO(article);
    res
      .status(201)
      .json(
        new ApiResponse(
          201, 
          articleDTO,
          'Tạo bài viết thành công, đang chờ duyệt.'
        )
      );
  } catch (error) {
    next(error);
  }
};

const uploadMedia = async (req, res, next) => {
  try {
    const data = await articleService.uploadMedia(req.file);
    res
      .status(201) 
      .json(
        new ApiResponse(
          201, 
          data,
          'Upload media thành công.'
        )
      );
  } catch (error) {
    next(error);
  }
};

const getArticleBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const article = await articleService.getArticleBySlug(slug);
    const articleDTO = new ArticleDetailDTO(article);
    res
      .status(200) 
      .json(
        new ApiResponse(200, articleDTO, 'Lấy bài viết thành công.') 
      );
  } catch (error) {
    next(error);
  }
};

const getAllArticles = async (req, res, next) => {
  try {
    const articles = await articleService.getAllArticles(req.query);
    const articlesDTO = articles.map(
      (article) => new ArticleSummaryDTO(article)
    );
    res
      .status(200) 
      .json(
        new ApiResponse(
            200,
            'Lấy danh sách bài viết thành công.',
          articlesDTO,
          
        )
      );
  } catch (error) {
    next(error);
  }
};

const getFeedArticles = async (req, res, next) => {
  try {
    const articles = await articleService.getFeedArticles(
      req.user.id,
      req.query
    );
    const articlesDTO = articles.map(
      (article) => new ArticleSummaryDTO(article)
    );
    res
      .status(200) 
      .json(
        new ApiResponse(
          200,
          articlesDTO,
          'Lấy feed thành công.'
        )
      );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createArticle,
  uploadMedia,
  getArticleBySlug,
  getAllArticles,
  getFeedArticles,
};
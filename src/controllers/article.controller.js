const ApiResponse = require("../utils/ApiResponse");
const articleService = require("../services/article.service");
const { ArticleDetailDTO, ArticleSummaryDTO } = require("../dtos/article.dto");
const asyncHandler = require("../utils/asyncHandler");

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
          "Tạo bài viết thành công, đang chờ duyệt.",
          articleDTO
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
      .json(new ApiResponse(201, "Upload media thành công.", data));
  } catch (error) {
    next(error);
  }
};

const getArticleBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user ? req.user.id : null;
    const article = await articleService.getArticleBySlug(userId, slug);
    const articleDTO = new ArticleDetailDTO(article);
    res
      .status(200)
      .json(new ApiResponse(200, "Lấy bài viết thành công.", articleDTO));
  } catch (error) {
    next(error);
  }
};

const getAllArticles = async (req, res, next) => {
  try {
    const { articles, pagination } = await articleService.getAllArticles(
      req.user.id,
      req.query
    );

    const articlesDTO = articles.map(
      (article) => new ArticleSummaryDTO(article)
    );

    res.status(200).json(
      new ApiResponse(200, "Lấy danh sách bài viết thành công.", {
        articles: articlesDTO,
        pagination: pagination,
      })
    );
  } catch (error) {
    next(error);
  }
};

const getFeedArticles = async (req, res, next) => {
  try {
    const { articles, pagination } = await articleService.getFeedArticles(
      req.user.id,
      req.query
    );

    const articlesDTO = articles.map(
      (article) => new ArticleSummaryDTO(article)
    );

    res.status(200).json(
      new ApiResponse(200, "Lấy feed thành công.", {
        articles: articlesDTO,
        pagination: pagination,
      })
    );
  } catch (error) {
    next(error);
  }
};

const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const article = await articleService.updateArticle(
      id,
      req.user.id,
      req.body,
      req.file
    );
    const articleDTO = new ArticleDetailDTO(article);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Cập nhật bài viết thành công, đang chờ duyệt.",
          articleDTO
        )
      );
  } catch (error) {
    next(error);
  }
};

const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    await articleService.deleteArticle(id, req.user.id);
    res
      .status(200)
      .json(new ApiResponse(200, "Xóa bài viết thành công.", null));
  } catch (error) {
    next(error);
  }
};

const getRelatedArticles = async (req, res, next) => {
  try {
    console.log("Fetching related articles with query:", req.query);
    const { articles, pagination } = await articleService.getRelatedArticles(
      req.query
    );

    const articlesDTO = articles.map(
      (article) => new ArticleSummaryDTO(article)
    );

    res.status(200).json(
      new ApiResponse(200, "Lấy danh sách bài viết liên quan thành công.", {
        articles: articlesDTO,
        pagination: pagination,
      })
    );
  } catch (error) {
    next(error);
  }
};

const getAuthorArticles = async (req, res, next) => {
  try {
    const { articles, pagination } = await articleService.getAuthorArticles(
      req.query
    );

    const articlesDTO = articles.map(
      (article) => new ArticleSummaryDTO(article)
    );

    res.status(200).json(
      new ApiResponse(200, "Lấy danh sách bài viết của tác giả thành công.", {
        articles: articlesDTO,
        pagination: pagination,
      })
    );
  } catch (error) {
    next(error);
  }
};

const toggleLike = asyncHandler(async (req, res) => {
  const { id: articleId } = req.params;
  const { id: userId } = req.user;

  const result = await articleService.toggleArticleLike(userId, articleId);

  res
    .status(200)
    .json(new ApiResponse(200, "Cập nhật like thành công.", result));
});

const toggleBookmark = asyncHandler(async (req, res) => {
  const { id: articleId } = req.params;
  const { id: userId } = req.user;

  const result = await articleService.toggleArticleBookmark(userId, articleId);

  res
    .status(200)
    .json(new ApiResponse(200, "Cập nhật bookmark thành công.", result));
});

module.exports = {
  createArticle,
  updateArticle,
  deleteArticle,
  uploadMedia,
  getArticleBySlug,
  getAllArticles,
  getFeedArticles,
  getRelatedArticles,
  getAuthorArticles,
  toggleLike,
  toggleBookmark,
};

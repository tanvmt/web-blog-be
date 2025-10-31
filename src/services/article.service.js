const articleRepository = require("../repositories/article.repository");
const interactionRepository = require("../repositories/interaction.repopsitory");
const slugify = require("../utils/slugify");
const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/AppError");
const { default: axios } = require("axios");
const { ar } = require("zod/locales");
const notificationService = require("./notification.service");

const createArticle = async (body, userId, file) => {
  if (!file) {
    throw new BadRequestError("Vui lòng cung cấp ảnh bìa (thumbnail).");
  }

  const thumbnailUrl = file.location;

  const { title, content, readTimeMinutes } = body;

  let tagsToConnect = [];
  if (body.tags) {
    try {
      const tagNames = JSON.parse(body.tags);
      if (Array.isArray(tagNames) && tagNames.length > 0) {
        tagsToConnect = tagNames.map((name) => ({
          where: { name: name.trim() },
          create: { name: name.trim() },
        }));
      }
    } catch (e) {
      throw new BadRequestError(
        "Định dạng tags không hợp lệ (phải là JSON string array)."
      );
    }
  }

  const slug = slugify(title);
  const articleData = {
    title,
    content,
    slug,
    thumbnailUrl,
    authorId: userId,
    moderationStatus: "public",
    readTimeMinutes: parseInt(readTimeMinutes, 10) || 5,
  };

  const article = await articleRepository.create(articleData, tagsToConnect);
  return article;
};

const uploadMedia = async (file) => {
  if (!file) {
    throw new BadRequestError("Upload media thất bại.");
  }
  return { url: file.location };
};

const getArticleBySlug = async (userId, slug) => {
  const article = await articleRepository.findBySlug(userId, slug);
  if (!article) {
    throw new NotFoundError("Không tìm thấy bài viết.");
  }
  return article;
};

const getAllArticles = async (userId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const { articles, totalCount } = await articleRepository.findAll(userId, {
    skip,
    take: limit,
  });

  const totalPages = Math.ceil(totalCount / limit);
  const pagination = {
    currentPage: page,
    totalPages,
    totalCount,
    limit,
  };

  return { articles, pagination };
};

const getRecommendedArticles = async (query) => {
  const userId = parseInt(query.userId);
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;

  if (!userId) throw new BadRequestError("User ID là bắt buộc.");

  try {
    const rcmApi = `http://localhost:5000/articles/recommend`;
    const response = await axios.get(rcmApi, {
      params: { user: userId, page, size: limit },
    });

    const articles = response.data.data.results;
    const articleIds = articles.map((a) => a.id);

    const resultArticles = await articleRepository.findByIds(
      userId,
      articleIds
    );

    const orderedArticles = articleIds
      .map((id) => resultArticles.find((a) => a.id === id))
      .filter(Boolean);

    const pagination = {
      currentPage: page,
      limit,
      totalCount: 1000, // giả sử tổng số bài viết là 1000
      totalPages: 10,
    };

    return { articles: orderedArticles, pagination };
  } catch (error) {
    console.error("Error calling Python service:", error.message);
    throw error;
  }
};

const getFeedArticles = async (userId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const { articles, totalCount } = await articleRepository.findFeed(userId, {
    skip,
    take: limit,
  });

  const totalPages = Math.ceil(totalCount / limit);
  const pagination = {
    currentPage: page,
    totalPages,
    totalCount,
    limit,
  };

  return { articles, pagination };
};

const updateArticle = async (articleId, userId, body, file) => {
  const article = await articleRepository.findById(articleId);
  if (!article) {
    throw new NotFoundError("Không tìm thấy bài viết.");
  }
  if (article.authorId !== userId) {
    throw new ForbiddenError("Bạn không có quyền chỉnh sửa bài viết này.");
  }

  const articleData = { ...body };

  if (file) {
    articleData.thumbnailUrl = file.location;
  }

  if (body.title && body.title !== article.title) {
    articleData.slug = slugify(body.title);
  }

  let tagsToConnect = [];
  if (body.tags) {
    try {
      const tagNames = JSON.parse(body.tags);
      if (Array.isArray(tagNames) && tagNames.length > 0) {
        tagsToConnect = tagNames.map((name) => ({
          where: { name: name.trim() },
          create: { name: name.trim() },
        }));
      }
    } catch (e) {
      throw new BadRequestError(
        "Định dạng tags không hợp lệ (phải là JSON string array)."
      );
    }
  }

  articleData.moderationStatus = "public";
  articleData.updatedAt = new Date();

  delete articleData.tags;
  delete articleData.content;
  if (body.content) {
    articleData.content = body.content;
  }

  const updatedArticle = await articleRepository.update(
    articleId,
    articleData,
    tagsToConnect
  );
  return updatedArticle;
};

const deleteArticle = async (articleId, userId) => {
  const article = await articleRepository.findById(articleId);
  if (!article) {
    throw new NotFoundError("Không tìm thấy bài viết.");
  }
  if (article.authorId !== userId) {
    throw new ForbiddenError("Bạn không có quyền xóa bài viết này.");
  }
  await articleRepository.remove(articleId);
};

const getRelatedArticles = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 3;
  const skip = (page - 1) * limit;

  if (!query.tagIds) {
    throw new BadRequestError("Cần cung cấp tagIds.");
  }

  const tagIds = query.tagIds
    .split(",")
    .map((id) => parseInt(id.trim(), 10))
    .filter(Number.isFinite);

  if (tagIds.length === 0) {
    return {
      articles: [],
      pagination: { currentPage: page, totalPages: 0, totalCount: 0, limit },
    };
  }

  const excludeId = parseInt(query.excludeId, 10) || 0;

  const { articles, totalCount } = await articleRepository.findRelatedByTags(
    tagIds,
    excludeId,
    { skip, take: limit }
  );

  const totalPages = Math.ceil(totalCount / limit);
  const pagination = { currentPage: page, totalPages, totalCount, limit };

  return { articles, pagination };
};

const getAuthorArticles = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 3;
  const skip = (page - 1) * limit;

  if (!query.authorId) {
    throw new BadRequestError("Cần cung cấp authorId.");
  }

  const authorId = parseInt(query.authorId, 10);
  const excludeId = parseInt(query.excludeId, 10) || 0;

  if (isNaN(authorId)) {
    throw new BadRequestError("authorId không hợp lệ.");
  }

  const { articles, totalCount } = await articleRepository.findByAuthor(
    authorId,
    excludeId,
    { skip, take: limit }
  );

  const totalPages = Math.ceil(totalCount / limit);
  const pagination = { currentPage: page, totalPages, totalCount, limit };

  return { articles, pagination };
};

const toggleArticleLike = async (userId, articleIdStr) => {
  const articleId = parseInt(articleIdStr, 10);
  if (isNaN(articleId)) {
    throw new BadRequestError("Article ID không hợp lệ.");
  }

  const article = await articleRepository.findById(articleId);
  if (!article) {
    throw new NotFoundError("Không tìm thấy bài viết.");
  }

  const result = await interactionRepository.toggleLike(userId, articleId);

  if (result.isLiked && userId !== article.authorId) {
    await notificationService.createNotification({
      recipientId: article.authorId,
      actorId: userId,
      type: "like",
      articleId: article.id,
    });
  }
  return result;
};

const toggleArticleBookmark = async (userId, articleIdStr) => {
  const articleId = parseInt(articleIdStr, 10);
  if (isNaN(articleId)) {
    throw new BadRequestError("Article ID không hợp lệ.");
  }

  const article = await articleRepository.findById(articleId);
  if (!article) {
    throw new NotFoundError("Không tìm thấy bài viết.");
  }

  const result = await interactionRepository.toggleBookmark(userId, articleId);
  return result;
};

module.exports = {
  createArticle,
  updateArticle,
  deleteArticle,
  uploadMedia,
  getArticleBySlug,
  getAllArticles,
  getRecommendedArticles,
  getFeedArticles,
  getRelatedArticles,
  getAuthorArticles,
  toggleArticleLike,
  toggleArticleBookmark,
};

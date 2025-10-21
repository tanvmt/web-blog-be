// src/services/article.service.js
const articleRepository = require('../repositories/article.repository');
const slugify = require('../utils/slugify');
const {
  BadRequestError,
  NotFoundError,
} = require('../utils/AppError');

const createArticle = async (body, userId, file) => {
  if (!file) {
    throw new BadRequestError('Vui lòng cung cấp ảnh bìa (thumbnail).');
  }
  const thumbnailUrl = file.location;

  const { title, content } = body;

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
        'Định dạng tags không hợp lệ (phải là JSON string array).'
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
    moderationStatus: 'PENDING',
  };

  const article = await articleRepository.create(articleData, tagsToConnect);
  return article;
};

const uploadMedia = async (file) => {
  if (!file) {
    throw new BadRequestError('Upload media thất bại.');
  }
  return { url: file.location };
};

const getArticleBySlug = async (slug) => {
  const article = await articleRepository.findBySlug(slug);
  if (!article) {
    throw new NotFoundError('Không tìm thấy bài viết.');
  }
  return article;
};

const getAllArticles = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const articles = await articleRepository.findAll({ skip, take: limit });
  return articles;
};

const getFeedArticles = async (userId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const articles = await articleRepository.findFeed(userId, {
    skip,
    take: limit,
  });
  return articles;
};

module.exports = {
  createArticle,
  uploadMedia,
  getArticleBySlug,
  getAllArticles,
  getFeedArticles,
};
const articleRepository = require('../repositories/article.repository');
const slugify = require('../utils/slugify');
const {
    BadRequestError,
    NotFoundError,
    ForbiddenError,
} = require('../utils/AppError');

const createArticle = async (body, userId, file) => {
    if (!file) {
        throw new BadRequestError('Vui lòng cung cấp ảnh bìa (thumbnail).');
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
      moderationStatus: 'pending',
      readTimeMinutes: parseInt(readTimeMinutes, 10) || 5,
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
  
    const { articles, totalCount } = await articleRepository.findAll({
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
  
  const getFeedArticles = async (userId, query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
  
    const { articles, totalCount } = await articleRepository.findFeed(
      userId,
      {
        skip,
        take: limit,
      }
    );
  
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
      throw new NotFoundError('Không tìm thấy bài viết.');
    }
    if (article.authorId !== userId) {
      throw new ForbiddenError('Bạn không có quyền chỉnh sửa bài viết này.');
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
          'Định dạng tags không hợp lệ (phải là JSON string array).'
        );
      }
    }
  
    articleData.moderationStatus = 'pending';
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
      throw new NotFoundError('Không tìm thấy bài viết.');
    }
    if (article.authorId !== userId) {
      throw new ForbiddenError('Bạn không có quyền xóa bài viết này.');
    }
    await articleRepository.remove(articleId);
  };

module.exports = {
    createArticle,
    updateArticle,
    deleteArticle,
    uploadMedia,
    getArticleBySlug,
    getAllArticles,
    getFeedArticles,
};
const commentRepository = require("../repositories/comment.repository");
const articleRepository = require("../repositories/article.repository");
const { NotFoundError, BadRequestError } = require("../utils/AppError");

const getCommentsByArticle = async (query) => {
  const articleId = parseInt(query.articleId, 10);
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const article = await articleRepository.findById(articleId);
  if (!article) {
    throw new NotFoundError("Không tìm thấy bài viết.");
  }

  const { comments, totalCount } = await commentRepository.findByArticleId(
    articleId,
    { skip, take: limit }
  );

  const totalPages = Math.ceil(totalCount / limit);
  const pagination = {
    currentPage: page,
    totalPages,
    totalCount,
    limit,
  };

  return { comments, pagination };
};

const createComment = async (userId, body) => {
  const { articleId, content, parentId } = body;

  const article = await articleRepository.findById(articleId);
  if (!article) {
    throw new NotFoundError("Không tìm thấy bài viết để bình luận.");
  }

  if (parentId) {
    const parentComment = await commentRepository.findById(parentId);
    if (!parentComment) {
      throw new NotFoundError("Bình luận cha không tồn tại.");
    }
    if (parentComment.articleId !== articleId) {
      throw new BadRequestError("Bình luận cha không thuộc bài viết này.");
    }
    if (parentComment.parentId !== null) {
      throw new BadRequestError("Chỉ có thể trả lời bình luận gốc.");
    }
  }

  const isAuthor = article.authorId === userId;

  const newComment = await commentRepository.create({
    userId,
    articleId,
    content,
    isAuthor,
    parentId,
  });

  return newComment;
};

module.exports = {
  getCommentsByArticle,
  createComment,
};

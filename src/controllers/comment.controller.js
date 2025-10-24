const commentService = require('../services/comment.service');
const ApiResponse = require('../utils/ApiResponse');
const { CommentDTO } = require('../dtos/comment.dto');
const asyncHandler = require('../utils/asyncHandler');

const getComments = asyncHandler(async (req, res) => {
  const { comments, pagination } = await commentService.getCommentsByArticle(
    req.query
  );

  const commentsDTO = comments.map((comment) => new CommentDTO(comment));

  res
    .status(200)
    .json(
      new ApiResponse(200, 'Lấy bình luận thành công.', {
        comments: commentsDTO,
        pagination,
      })
    );
});

const createComment = asyncHandler(async (req, res) => {
  const userId = req.user.id; 
  const comment = await commentService.createComment(userId, req.body);

  const commentDTO = new CommentDTO(comment);

  res
    .status(201)
    .json(
      new ApiResponse(201, 'Bình luận thành công.', commentDTO)
    );
});

module.exports = {
  getComments,
  createComment,
};
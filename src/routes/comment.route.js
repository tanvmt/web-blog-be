const express = require("express");
const commentController = require("../controllers/comment.controller");
const auth = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const commentValidation = require("../validations/comment.validation");

const router = express.Router();

router.get(
  "/",
  auth,
  validate(commentValidation.getComments),
  commentController.getComments
);

router.post(
  "/",
  auth,
  validate(commentValidation.createComment),
  commentController.createComment
);

module.exports = router;

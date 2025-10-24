class AuthorDTO {
  constructor(author) {
    this.id = author.id;
    this.fullName = author.fullName;
    this.avatarUrl = author.avatarUrl;
  }
}

class TagDTO {
  constructor(tag) {
    this.id = tag.id;
    this.name = tag.name;
  }
}

class CommentDTO {
  constructor(comment) {
    this.id = comment.id;
    this.content = comment.content;
    this.createdAt = comment.createdAt;
    this.author = comment.author ? new AuthorDTO(comment.author) : null;
  }
}

class ArticleDetailDTO {
  constructor(article) {
    this.id = article.id;
    this.title = article.title;
    this.slug = article.slug;
    this.content = article.content;
    this.thumbnailUrl = article.thumbnailUrl;
    this.moderationStatus = article.moderationStatus;
    this.createdAt = article.createdAt;
    this.author = article.author ? new AuthorDTO(article.author) : null;
    this.tags = article.articleTags
    ? article.articleTags.map((at) => new TagDTO(at.tag))
    : [];
    this.comments = article.comments
      ? article.comments.map((comment) => new CommentDTO(comment))
      : [];
  }
}

class ArticleSummaryDTO {
  constructor(article) {
    this.id = article.id;
    this.title = article.title;
    this.slug = article.slug;
    this.thumbnailUrl = article.thumbnailUrl;
    this.createdAt = article.createdAt;
    this.author = article.author ? new AuthorDTO(article.author) : null;
    this.tags = article.articleTags
    ? article.articleTags.map((at) => new TagDTO(at.tag))
    : [];
  }
}

module.exports = {
  ArticleDetailDTO,
  ArticleSummaryDTO,
};
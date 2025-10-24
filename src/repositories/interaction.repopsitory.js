const prisma = require("../config/db.config");

const toggleLike = async (userId, articleId) => {
  const whereClause = {
    userId_articleId: {
      userId: userId,
      articleId: articleId,
    },
  };

  const existingLike = await prisma.articleLike.findUnique({
    where: whereClause,
  });

  let isLiked;
  if (existingLike) {
    await prisma.articleLike.delete({ where: whereClause });
    isLiked = false;
  } else {
    await prisma.articleLike.create({
      data: {
        userId: userId,
        articleId: articleId,
      },
    });
    isLiked = true;
  }

  const likesCount = await prisma.articleLike.count({
    where: { articleId: articleId },
  });

  return { isLiked, likesCount };
};

const toggleBookmark = async (userId, articleId) => {
  const whereClause = {
    userId_articleId: {
      userId: userId,
      articleId: articleId,
    },
  };

  const existingBookmark = await prisma.bookmark.findUnique({
    where: whereClause,
  });

  let isBookmarked;
  if (existingBookmark) {
    await prisma.bookmark.delete({ where: whereClause });
    isBookmarked = false;
  } else {
    await prisma.bookmark.create({
      data: {
        userId: userId,
        articleId: articleId,
      },
    });
    isBookmarked = true;
  }

  return { isBookmarked };
};

module.exports = {
  toggleLike,
  toggleBookmark,
};

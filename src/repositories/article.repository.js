const prisma = require("../config/db.config");

const create = async (articleData, tagsToConnect) => {
  return prisma.article.create({
    data: {
      ...articleData,
      articleTags: {
        create: tagsToConnect.map((tag) => ({
          tag: {
            connectOrCreate: tag,
          },
        })),
      },
    },
    include: {
      author: true,
      articleTags: {
        include: {
          tag: true,
        },
      },
    },
  });
};

const findBySlug = async (userId, slug) => {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      articleTags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          articleLikes: true,
          comments: true,
        },
      },
      articleLikes: userId
        ? {
          where: { userId },
        }
        : false,
      bookmarks: userId
        ? {
          where: { userId },
        }
        : false,
    },
  });
};

const findByIds = async (userId, articleIds) => {
  return prisma.article.findMany({
    where: {
      id: { in: articleIds },
      moderationStatus: "public",
    },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      articleTags: {
        include: { tag: true },
      },
      _count: {
        select: { articleLikes: true, comments: true },
      },
      articleLikes: userId
        ? { where: { userId }, select: { userId: true } }
        : false,
      bookmarks: userId
        ? { where: { userId }, select: { userId: true } }
        : false,
    },
  });
};

const findByIdsV2 = async (userId, articleIds) => {
  return prisma.article.findMany({
    where: {
      id: { in: articleIds },
      moderationStatus: "public",
    },
    include: {
      author: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
        },
      },
      articleTags: {
        include: { tag: true },
      },
      _count: {
        select: { articleLikes: true, comments: true },
      },
      articleLikes: userId
        ? { where: { userId }, select: { userId: true } }
        : false,
      bookmarks: userId
        ? { where: { userId }, select: { userId: true } }
        : false,
    },
  });
};






const findAll = async (userId, { skip, take }) => {
  const whereClause = {
    moderationStatus: "public",
  };

  const [articles, totalCount] = await prisma.$transaction([
    prisma.article.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        articleTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            articleLikes: true,
            comments: true,
          },
        },
        articleLikes: userId
          ? {
              where: { userId },
            }
          : false,
        bookmarks: userId
          ? {
              where: { userId },
            }
          : false,
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take,
    }),
    prisma.article.count({
      where: whereClause,
    }),
  ]);

  return { articles, totalCount };
};

const findFeed = async (userId, { skip, take }) => {
  const whereClause = {
    moderationStatus: "public",
    author: {
      followers: {
        some: {
          followerId: userId,
        },
      },
    },
  };

  const [articles, totalCount] = await prisma.$transaction([
    prisma.article.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        articleTags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            articleLikes: true,
            comments: true,
          },
        },
        articleLikes: userId
          ? {
              where: { userId },
            }
          : false,
        bookmarks: userId
          ? {
              where: { userId },
            }
          : false,
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take,
    }),
    prisma.article.count({
      where: whereClause,
    }),
  ]);

  return { articles, totalCount };
};

const findById = async (id) => {
  const articleId = Number(id);

  if (isNaN(articleId)) {
    throw new Error("Invalid article ID format.");
  }

  return prisma.article.findUnique({
    where: {
      id: articleId,
    },
  });
};

const update = async (id, articleData, tagsToConnect) => {
  const articleId = Number(id);

  if (isNaN(articleId)) {
    throw new Error("Invalid article ID format for update.");
  }

  return prisma.article.update({
    where: {
      id: articleId,
    },
    data: {
      ...articleData,
      articleTags: {
        deleteMany: {},
        create: tagsToConnect.map((tag) => ({
          tag: {
            connectOrCreate: tag,
          },
        })),
      },
    },
    include: {
      author: true,
      articleTags: {
        include: {
          tag: true,
        },
      },
    },
  });
};

const remove = async (id) => {
  const articleId = Number(id);
  await prisma.articleLike.deleteMany({ where: { articleId: articleId } });
  await prisma.bookmark.deleteMany({ where: { articleId: articleId } });
  await prisma.comment.deleteMany({ where: { articleId: articleId } });
  await prisma.articleTag.deleteMany({ where: { articleId: articleId } });
  await prisma.notification.deleteMany({ where: { articleId: articleId } });

  return prisma.article.delete({
    where: { id: articleId },
  });
};

const findRelatedByTags = async (tagIds, excludeId, { skip, take }) => {
  const whereClause = {
    moderationStatus: "public",
    id: {
      not: excludeId,
    },
    articleTags: {
      some: {
        tagId: {
          in: tagIds,
        },
      },
    },
  };

  const [articles, totalCount] = await prisma.$transaction([
    prisma.article.findMany({
      where: whereClause,
      include: {
        author: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        articleTags: { include: { tag: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take,
    }),
    prisma.article.count({ where: whereClause }),
  ]);

  return { articles, totalCount };
};

const findByAuthor = async (authorId, excludeId, { skip, take }) => {
  const whereClause = {
    moderationStatus: "public",
    authorId: authorId,
    id: {
      not: excludeId,
    },
  };

  const [articles, totalCount] = await prisma.$transaction([
    prisma.article.findMany({
      where: whereClause,
      include: {
        author: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        articleTags: { include: { tag: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take,
    }),
    prisma.article.count({ where: whereClause }),
  ]);

  return { articles, totalCount };
};

module.exports = {
  create,
  update,
  remove,
  findBySlug,
  findAll,
  findFeed,
  findById,
  findByIds,
  findByIdsV2,
  findRelatedByTags,
  findByAuthor,
};

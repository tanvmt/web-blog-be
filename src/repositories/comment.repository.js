// src/repositories/comment.repository.js
const prisma = require("../config/db.config");

const findByArticleId = async (articleId, { skip, take }) => {
  const whereClause = {
    articleId: articleId,
    parentId: null,
  };

  const [comments, totalCount] = await prisma.$transaction([
    prisma.comment.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, fullName: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.comment.count({
      where: whereClause,
    }),
  ]);

  return { comments, totalCount };
};

const create = async ({ userId, articleId, content, isAuthor, parentId }) => {
  return prisma.comment.create({
    data: {
      content,
      isAuthor,
      user: {
        connect: { id: userId },
      },
      article: {
        connect: { id: articleId },
      },
      ...(parentId && {
        parent: {
          connect: { id: parentId },
        },
      }),
    },
    include: {
      user: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      replies: true,
    },
  });
};

const findById = async (id) => {
  return prisma.comment.findUnique({ where: { id: id } });
};

const update = async (id, content) => {
  return prisma.comment.update({
    where: { id: id },
    data: { content: content },
    include: {
      user: {
        select: { id: true, fullName: true, avatarUrl: true },
      },
      replies: {
        include: {
          user: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
};

const remove = async (id) => {
  return prisma.$transaction([
    prisma.comment.deleteMany({
      where: { parentId: id },
    }),
    prisma.comment.delete({
      where: { id: id },
    }),
  ]);
};

module.exports = {
  findByArticleId,
  create,
  findById,
  update,
  remove,
};

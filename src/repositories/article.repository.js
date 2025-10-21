const prisma = require('../config/db.config');

const create = async (articleData, tagsToConnect) => {
  return prisma.article.create({
    data: {
      ...articleData,
      tags: {
        connectOrCreate: tagsToConnect,
      },
    },
    include: {
      author: true,
      tags: true,
    },
  });
};

const findBySlug = async (slug) => {
    return prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: { 
              id: true, 
              fullName: true, 
              avatarUrl: true 
          },
        },
        articleTags: {
            include: {
              tag: true,
            },
        },
        comments: {
          include: {
            author: {
              select: { 
                  id: true, 
                  fullName: true, 
                  avatarUrl: true 
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  };
  
  const findAll = async ({ skip, take }) => {
    return prisma.article.findMany({
      where: {
        moderationStatus: 'approved', 
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
            include: {
              tag: true,
            },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  };
  
  const findFeed = async (userId, { skip, take }) => {
    return prisma.article.findMany({
      where: {
        moderationStatus: 'approved', 
        author: {
          followers: {
            some: {
              followerId: userId,
            },
          },
        },
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
            include: {
              tag: true,
            },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  };

module.exports = {
  create,
  findBySlug,
  findAll,
  findFeed,
};
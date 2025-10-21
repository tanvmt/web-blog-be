const prisma = require('../config/prisma');
const slugify = require('../utils/slugify');

const createArticle = async (req, res) => {
    try {
        const authorId = req.user.id;
        const { title, content, thumbnail_url, read_time_minutes, tags } = req.body;
        const tagOperations = tags.map(tagName => ({
            where: { name: tagName },
            create: { name: tagName }
        }));
        const slug = slugify(title);

        const newArticle = await prisma.article.create({ 
            data: {
                title,
                content,
                thumbnailUrl: thumbnail_url, 
                readTimeMinutes: read_time_minutes, 
                slug,
                authorId: authorId, 
                moderationStatus: 'pending', 
                
                articleTags: { 
                    create: tagOperations.map(op => ({
                        tag: { connectOrCreate: op }
                    }))
                }
            },
            include: { articleTags: { include: { tag: true } } }
        });
        res.status(201).json(newArticle);
    } catch (error) {
        console.error("Lỗi khi tạo bài viết:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

const getAllArticles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const articles = await prisma.article.findMany({
            where: {
                moderationStatus: 'approved'
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: skip,
            take: limit,
            include: {
                author: { 
                    select: { 
                        id: true, 
                        fullName: true, 
                        avatarUrl: true 
                    }
                },
                articleTags: { 
                    include: {
                        tag: { 
                            select: { name: true }
                        }
                    }
                }
            }
        });

        const totalArticles = await prisma.article.count({
            where: { moderationStatus: 'approved' }
        });

        const articlesWithSimpleTags = articles.map(article => ({
            ...article,
            tags: article.articleTags.map(at => at.tag.name) 
        }));


        res.status(200).json({
            articles: articlesWithSimpleTags,
            total: totalArticles,
            page: page,
            limit: limit,
            totalPages: Math.ceil(totalArticles / limit)
        });

    } catch (error) {
        console.error("Lỗi khi lấy bài viết:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

const getFeedArticles = async (req, res) => {
    try {
        const userId = req.user.id; 

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            select: { followedId: true }
        });
        const followingIds = following.map(f => f.followedId);

        if (followingIds.length === 0) {
             return res.status(200).json({
                articles: [],
                total: 0,
                page: 1,
                limit: limit,
                totalPages: 0
            });
        }

        const articles = await prisma.article.findMany({
            where: {
                authorId: {
                    in: followingIds 
                },
                moderationStatus: 'approved'
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: skip,
            take: limit,
            include: {
                author: { 
                    select: { id: true, fullName: true, avatarUrl: true }
                },
                articleTags: {
                    include: { tag: { select: { name: true } } }
                }
            }
        });

         const totalArticles = await prisma.article.count({
            where: {
                authorId: { in: followingIds },
                moderationStatus: 'approved'
            }
        });

        const articlesWithSimpleTags = articles.map(article => ({
            ...article,
            tags: article.articleTags.map(at => at.tag.name)
        }));

        res.status(200).json({
            articles: articlesWithSimpleTags,
            total: totalArticles,
            page: page,
            limit: limit,
            totalPages: Math.ceil(totalArticles / limit)
        });

    } catch (error) {
        console.error("Lỗi khi lấy feed bài viết:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

const getArticleBySlug = async (req, res) => {
     try {
        const { slug } = req.params;
        const article = await prisma.article.findUnique({
            where: { 
                slug: slug,
                moderation_status: 'approved'
            },
            include: {
                author: {
                    select: { id: true, fullName: true, avatar_url: true, bio: true }
                },
                articleTags: {
                    include: {
                        tag: true
                    }
                },
                comments: {
                    orderBy: { created_at: 'asc' },
                    include: {
                        user: {
                            select: { id: true, fullName: true, avatar_url: true }
                        }
                    }
                }
            }
        });

        if (!article) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        }

        res.status(200).json(article);
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết bài viết:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
}


module.exports = {
    createArticle,
    getAllArticles,
    getFeedArticles,
    getArticleBySlug
};
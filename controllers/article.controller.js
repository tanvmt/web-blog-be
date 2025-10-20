const prisma = require('../config/prisma');
const slugify = require('../utils/slugify');

const createArticle = async (req, res) => {
    try {
        const authorId = req.user.id;

        const { 
            title, 
            content, 
            thumbnail_url, 
            read_time_minutes, 
            tags
        } = req.body;

        // Biến mảng tên tags thành định dạng mà Prisma cần để 'connectOrCreate'
        const tagOperations = tags.map(tagName => {
            return {
                where: { name: tagName }, // Tìm tag theo tên
                create: { name: tagName }  // Nếu không thấy thì tạo tag mới
            };
        });

        // Tạo slug từ title
        const slug = slugify(title);

        // Tạo bài viết mới trong CSDL
        const newArticle = await prisma.articles.create({
            data: {
                title,
                content,
                thumbnail_url,
                read_time_minutes: parseInt(read_time_minutes, 10),
                slug,
                author_id: authorId,
                moderation_status: 'pending', // Mặc định chờ duyệt
                
                // Kết nối hoặc tạo tags thông qua bảng Article_Tags
                article_tags: {
                    create: tagOperations.map(op => ({
                        tag: {
                            connectOrCreate: op
                        }
                    }))
                }
            },
            // Lấy lại thông tin tags đã kết nối
            include: {
                article_tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        res.status(201).json(newArticle);

    } catch (error) {
        console.error("Lỗi khi tạo bài viết:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// API lấy danh sách bài viết (U5)
const getAllArticles = async (req, res) => {
    try {
        const articles = await prisma.articles.findMany({
            where: {
                moderation_status: 'approved' // Chỉ lấy bài đã duyệt
            },
            orderBy: {
                created_at: 'desc' // Sắp xếp mới nhất
            },
            include: {
                author: { // Lấy thông tin tác giả
                    select: { id: true, fullName: true, avatar_url: true }
                }
            }
        });
        res.status(200).json(articles);
    } catch (error) {
        console.error("Lỗi khi lấy bài viết:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

// API lấy chi tiết 1 bài viết
const getArticleBySlug = async (req, res) => {
     try {
        const { slug } = req.params;
        const article = await prisma.articles.findUnique({
            where: { 
                slug: slug,
                moderation_status: 'approved'
            },
            include: {
                author: {
                    select: { id: true, fullName: true, avatar_url: true, bio: true }
                },
                article_tags: {
                    include: {
                        tag: true
                    }
                },
                comments: { // Lấy cả bình luận
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
    getArticleBySlug
    // Thêm các hàm CRUD khác (update, delete) ở đây (U11)
};
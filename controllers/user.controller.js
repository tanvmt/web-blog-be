const prisma = require('../config/prisma');

// API Tạm thời để Login.jsx hoạt động
// Lấy thông tin user (trừ password) để trả về cho frontend
const getUserByIdForLogin = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            // Chỉ chọn các trường an toàn, không gửi password_hash
            select: {
                id: true,
                fullName: true,
                username: true,
                email: true,
                bio: true,
                avatarUrl: true,
                role: true,
                createdAt: true
                // (Sau này Người 1 có thể thêm 'following', 'followers' ở đây)
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy user' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Lỗi khi lấy user by ID:", error);
        res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
    }
};

module.exports = {
    getUserByIdForLogin
    // (Sau này Người 2 sẽ thêm các hàm: followUser, getProfile...)
};
const prisma = require('./prisma');

async function connectDB() {
    console.log('Đang kết nối CSDL...');

    await prisma.$connect();

    console.log('✅ Đã kết nối CSDL thành công!');
}


module.exports = connectDB;
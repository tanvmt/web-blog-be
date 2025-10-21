const { prisma } = require('../config/db.config');

const create = async (data) => {
    return prisma.user.create({ data });
};

const findByEmail = async (email) => {
    return prisma.user.findUnique({ where: { email } });
};

const findById = async (id) => {
    return prisma.user.findUnique({ where: { id } });
};

const updatePassword = async (id, password) => {
    return prisma.user.update({ where: { id }, data: { password } });
};

const updateVerification = async (id, isVerified) => {
    return prisma.user.update({ where: { id }, data: { isVerified } });
};

const findAll = async () => {
    return prisma.user.findMany();
};

module.exports = {
    create,
    findByEmail,
    findById,
    updatePassword,
    updateVerification,
    findAll,
};
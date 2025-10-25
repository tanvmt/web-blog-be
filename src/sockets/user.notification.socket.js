const { emitToUser } = require('../utils/websocket');

// Emit notification to specific user
const emitNotification = (userId, type, message) => {
    emitToUser(userId, 'notification', { type, message });
};

module.exports = { emitNotification };
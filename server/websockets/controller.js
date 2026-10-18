const clientsByUserId = new Map();

function addClient(userId, socket) {
    let sockets = clientsByUserId.get(userId);
    if (!sockets) {
        sockets = new Set();
    }
    sockets.add(socket);
    clientsByUserId.set(userId, sockets);

    socket.on('close', () => {
        sockets.delete(socket);
        clientsByUserId.set(userId, sockets);
        if (sockets.size === 0) {
            clientsByUserId.delete(userId);
        }
    });
}

function sendToUser(userId, message) {
    const sockets = clientsByUserId.get(userId);
    if (sockets) {
        for (const socket of sockets) {
            if (socket.readyState === socket.OPEN) {
                socket.send(JSON.stringify(message));
            }
        }
    }
}

function multicastToUsers(userIds, message) {
    for (const userId of userIds) {
        sendToUser(userId, message);
    }
}

module.exports = { addClient, sendToUser, multicastToUsers };
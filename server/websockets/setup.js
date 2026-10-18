const { validateTicket } = require("./tickets");
const { updateChat } = require("../routes/chats/chats.controller");
const { addClient } = require("./controller");

async function setupWebSocketServer(wss, server) {

    server.on('upgrade', (req, soc, head) => {
        try {
            const { searchParams } = new URL(req.url, 'http://localhost');
            const token = searchParams.get('token');
            if (!token) {
                soc.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                soc.destroy();
                return;
            }

            const userId = validateTicket(token);
            if (!userId) {
                soc.write('HTTP/1.1 403 Forbidden\r\n\r\n');
                soc.destroy();
                return;
            }
        
            wss.handleUpgrade(req, soc, head, (ws) => {
                ws.userId = userId; // Attach the userId to the WebSocket instance
                wss.emit('connection', ws, req);
            });
        }
        catch (error) {
            console.error('Error occurred while handling WebSocket upgrade:', error);
            soc.write('HTTP/1.1 500 Internal Server Error\r\n\r\n');
            soc.destroy();
        }

    });

    wss.on('connection', (ws, req) => {

        console.log('WebSocket connection established. UserId:', ws.userId);
        addClient(ws.userId, ws);
        ws.on('message', async (message) => {
            const { messageType, data} = JSON.parse(message.toString());
            if (messageType === 'chatMessage') {
                const { chatId, message } = data;
                const senderId = ws.userId;
                await updateChat(chatId, message, senderId);
            }
        });
    });
}

module.exports = setupWebSocketServer;
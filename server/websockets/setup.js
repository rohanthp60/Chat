const { validateTicket } = require("./tickets");
const { updateChat } = require("../routes/chats/chats.controller");
const { addClient } = require("./controller");

async function setupWebSocketServer(wss, server) {
    server.on("upgrade", (request, socket, head) => {
        try {
            const requestUrl = new URL(request.url, "http://localhost");
            if (requestUrl.pathname !== "/ws") {
                socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
                socket.destroy();
                return;
            }

            const { searchParams } = requestUrl;
            const token = searchParams.get('token');
            if (!token) {
                rejectUpgrade(socket, 401, "Unauthorized");
                return;
            }

            const userId = validateTicket(token);
            if (!userId) {
                rejectUpgrade(socket, 403, "Forbidden");
                return;
            }
        
            wss.handleUpgrade(request, socket, head, (ws) => {
                ws.userId = userId;
                wss.emit("connection", ws, request);
            });
        }
        catch (error) {
            console.error("Error occurred while handling WebSocket upgrade:", error);
            rejectUpgrade(socket, 500, "Internal Server Error");
        }
    });

    wss.on("connection", (ws) => {
        console.log("WebSocket connection established. UserId:", ws.userId);
        addClient(ws.userId, ws);

        ws.on("message", async (rawMessage) => {
            try {
                const payload = JSON.parse(rawMessage.toString());
                if (payload?.messageType !== "chatMessage") {
                    sendError(ws, "Unsupported message type");
                    return;
                }

                const chatId = payload.data?.chatId;
                const message = payload.data?.message;
                if (typeof chatId !== "string" || typeof message !== "string" || !message.trim()) {
                    sendError(ws, "chatId and message are required");
                    return;
                }

                await updateChat(chatId, message.trim(), ws.userId);
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
                sendError(ws, "Unable to process chat message");
            }
        });

        ws.on("close", () => {
            console.log("WebSocket connection closed. UserId:", ws.userId);
        });

        ws.on("error", (error) => {
            console.error("WebSocket error for UserId:", ws.userId, "Error:", error);
        });
    });
}

function rejectUpgrade(socket, statusCode, statusText) {
    socket.write(`HTTP/1.1 ${statusCode} ${statusText}\r\n\r\n`);
    socket.destroy();
}

function sendError(ws, message) {
    if (ws.readyState === 1) {
        ws.send(JSON.stringify({
            messageType: "error",
            data: { message }
        }));
    }
}

module.exports = setupWebSocketServer;
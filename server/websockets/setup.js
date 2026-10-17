const { validateTicket } = require("./tickets");

async function setupWebSocketServer(wss, server) {

    server.on('upgrade', (req, soc, head) => {
        try {
            const { searchParams } = new URL(req.url);
            const token = searchParams.get('token');
            if (!token) {
                soc.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                soc.destroy();
                return;
            }
        
            if (!validateTicket(token)) {
                soc.write('HTTP/1.1 403 Forbidden\r\n\r\n');
                soc.destroy();
                return;
            }
        
            wss.handleUpgrade(req, soc, head, (ws) => {
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
        console.log('WebSocket connection established.');
    });
}

module.exports = setupWebSocketServer;
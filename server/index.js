const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { WebSocketServer } = require("ws");
dotenv.config();

const { checkDBConnection } = require("./database")
const setupWebSocketServer = require("./websockets/setup");
const auth = require("./auth/auth.api");
const { checkAuth } = require("./middlewares/auth");
const routes = require("./routes");

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

const port = 3000;

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

app.use('/auth', auth);
app.use(checkAuth);


app.use('/api', routes);

async function start() {
    try {
        await checkDBConnection();
        console.log("Database connection established.");
        await setupWebSocketServer(wss, server);
        console.log("WebSocket server setup completed.");
        server.listen(port, () => {
            console.log("Server listening on port 3000.");
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

start();
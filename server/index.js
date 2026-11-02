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

const port = Number.parseInt(process.env.PORT, 10) || 3000;

const allowedOrigins = process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN
        .split(",")
        .map(origin => origin.trim().replace(/\/+$/, ""))
        .filter(Boolean)
    : process.env.NODE_ENV !== "production"
        ? ["http://localhost:5173"]
        : [];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ""))) {
            callback(null, true);
            return;
        }

        callback(null, false);
    }
}));

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use('/auth', auth);
app.use(checkAuth);
app.use('/api', routes);
app.use('/', (req, res) => {
    res.send({ message: "Welcome to the API" });
});

async function start() {
    try {
        await checkDBConnection();
        console.log("Database connection established.");
        await setupWebSocketServer(wss, server);
        console.log("WebSocket server setup completed.");
        server.listen(port, () => {
            console.log(`Server listening on port ${port}.`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

start();
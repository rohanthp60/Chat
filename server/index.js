const express = require("express");
const cors = require("cors");

const { checkDBConnection } = require("./database")
const auth = require("./auth/auth.api");

const app = express();
const port = 3000;

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

app.use('/auth', auth);
app.get('/', (req, res) => {
    return res.send({ message: 'hello' });
});


async function start() {
    try {
        await checkDBConnection();
        console.log("Database connection established.");
        app.listen(port, () => {
            console.log("Server listening on port 3000.");
        });
    } catch (error) {
        console.error("Unable to connect to database:", error);
        process.exit(1);
    }
}

start();
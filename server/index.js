const express = require("express");
const { checkDBConnection } = require("./database")

const app = express();
const port = 3000;

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
const router = require("express").Router();
const contacts = require("./contacts");
const websockets = require("../websockets/.api");
const chats = require("./chats/chats.api");

router.use("/websockets", websockets);

router.use("/contacts", contacts);

router.use("/chats", chats);

module.exports = router;
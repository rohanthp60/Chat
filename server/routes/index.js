const router = require("express").Router();
const contacts = require("./contacts");

router.use("/contacts", contacts);

module.exports = router;
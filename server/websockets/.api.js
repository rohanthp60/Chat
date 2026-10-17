const router = require("express").Router();
const { getTicket } = require("../websockets/tickets");

router.get("/get-ticket", async (request, response) => {
    const ticket = getTicket();
    return response.status(200).send({ success: true, ticket });
});


module.exports = router;

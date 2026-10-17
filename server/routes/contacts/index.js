const router = require("express").Router();
const getContacts = require("./getContacts");

router.get("/", async (request, response) => {
    try {
        const contacts = await getContacts();
        return response.status(200).send({ success: true, contacts });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return response.status(500).send({ 
            success: false, 
            message: "Error occurred while fetching contacts!"
        });
    }
});

module.exports = router;
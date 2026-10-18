const router = require('express').Router();
const { getChats, createChat } = require('./chats.controller');

router.get('/', async (req, res) => {
    const userId = req?.userId;
    if (!userId) {
        return res.status(401).send({ success: false, message: "User ID missing" });
    }

    try {
        const chats = await getChats(userId);
        return res.status(200).send({ success: true, chats });
    } catch (error) {
        console.error("Error fetching chats:", error);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
});

router.post('/', async (req, res) => {
    const { participants } = req.body;
    if (!participants || !Array.isArray(participants) || participants.length <= 1) {
        return res.status(400).send({ success: false, message: "Participants are required" });
    }
    
    try {
        const chatId = await createChat(participants);
        return res.status(201).send({ success: true, chatId });
    } catch (error) {
        console.error("Error creating chat:", error);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
});

module.exports = router;
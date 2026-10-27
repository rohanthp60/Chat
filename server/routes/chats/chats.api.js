const router = require('express').Router();
const { getChats, createChat, getChatById } = require('./chats.controller');

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

router.get('/:chatId', async (req, res) => {
    const { chatId } = req.params;
    if (!chatId) {
        return res.status(400).send({ success: false, message: "Chat ID is required" });
    }

    try {
        const chat = await getChatById(chatId);
        return res.status(200).send({ success: true, chat });
    } catch (error) {
        console.error("Error fetching chat by ID:", error);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
});

router.post('/', async (req, res) => {
    let { participants } = req.body;
    participants = new Set(participants); // Remove duplicates
    participants = Array.from(participants);

    if (!participants.includes(req.userId)) {
        participants.push(req.userId);
    }
    if (participants.length <= 1) {
        return res.status(400).send({ success: false, message: "Participants are required" });
    }
    
    try {
        const chatId = await createChat({ ...req.body, participants });
        return res.status(201).send({ success: true, chatId });
    } catch (error) {
        console.error("Error creating chat:", error);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
});

module.exports = router;
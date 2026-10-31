const router = require('express').Router();
const { getChats, 
        createChat, 
        getChatById, 
        addParticipants, 
        removeParticipants,
        setAdmin,
        getParticipants
     } = require('./chats.controller');

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
        const chat = await getChatById(chatId, req.userId);
        return res.status(200).send({ success: true, chat });
    } catch (error) {
        console.error("Error fetching chat by ID:", error);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
});

router.post('/', async (req, res) => {
    let { participants } = req.body;
    const userId = req?.userId;
    participants = new Set(participants); // Remove duplicates
    participants = Array.from(participants);
    if (!participants.includes(req.userId)) {
        participants.push(req.userId);
    }
    if (participants.length <= 1) {
        return res.status(400).send({ success: false, message: "Participants are required" });
    }
    
    try {
        const chatId = await createChat({ ...req.body, participants, admin: userId });
        return res.status(201).send({ success: true, chatId });
    } catch (error) {
        console.error("Error creating chat:", error);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
});

router.delete('/:chatId/participants', async (req, res) => {
    const { chatId } = req.params;
    const userId = req?.userId;
    const { participants } = req.body;

    if (!chatId || !userId) {
        return res.status(400).send({ success: false, message: "Chat ID and User ID are required" });
    }
    
    try {
        await removeParticipants(chatId, participants, userId);
        return res.status(200).send({ success: true, message: "Participants removed successfully" });
    } catch (error) {
        console.error("Error removing participants:", error);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
});

router.post('/:chatId/participants', async (req, res) => {
    const { chatId } = req.params;
    const userId = req?.userId;
    const { participants } = req.body;

    if (!chatId || !userId) {
        return res.status(400).send({ success: false, message: "Chat ID and User ID are required" });
    }
    
    try {
        await addParticipants(chatId, participants, userId);
        return res.status(200).send({ success: true, message: "Participants added successfully" });
    } catch (error) {
        console.error("Error adding participants:", error);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
});

router.post('/:chatId/admin', async (req, res) => {
    const { chatId } = req.params;
    const { newAdminId } = req.body;

    if (!chatId || !newAdminId) {
        return res.status(400).send({ success: false, message: "Chat ID and new admin ID are required" });
    }

    try {
        await setAdmin(chatId, newAdminId, req.userId);
        return res.status(200).send({ success: true, message: "Admin updated successfully" });
    } catch (error) {
        console.error("Error setting new admin:", error);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
});

router.get('/:chatId/participants', async (req, res) => {
    const { chatId } = req.params;

    if (!chatId) {
        return res.status(400).send({ success: false, message: "Chat ID is required" });
    }

    try {
        const participants = await getParticipants(chatId);
        return res.status(200).send({ success: true, participants });
    } catch (error) {
        console.error("Error fetching participants:", error);
        return res.status(500).send({ success: false, message: "Internal server error" });
    }
});
module.exports = router;
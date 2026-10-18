const { Chats, Users, ChatUserRelation } = require('../../database');
const { multicastToUsers } = require('../../websockets/controller');
const { nanoid } = require('nanoid');
const { Op } = require('sequelize');

async function getChats(userId) {
    try {
        const chats = await Chats.findAll({ 
            include: [{
                model: Users,
                where: { userId },
            }],
            attributes: ['chatId', 'conversation'],
         });
        return chats.map(chat => ({
            chatId: chat.chatId,
            conversation: chat.conversation,
        }));
    } catch (error) {
        console.error("Error fetching chat:", error);
        throw error;
    }
}

async function createChat(participants) {
    try {
        const response = await Users.findAll({
            where: {
                userId: {
                    [Op.in]: participants
                }
            },
            attributes: ['userId']
        });
        const userIds = response.map(u => u.userId);

        if (!userIds?.length || userIds.length !== participants.length) {
            throw new Error("Some participants do not exist");
        }

        const chatId = nanoid(8);
        const newChat = await Chats.create({
            chatId,
            conversation: [],
            groupChat: participants.length > 2
        });
        await ChatUserRelation.bulkCreate(
            participants.map((userId) => ({
                chatId,
                userId
            }))
        );
        return chatId;
    } catch (error) {
        console.error("Error creating chat:", error);
        throw error;
    }
}

async function updateChat(chatId, message, senderId) {
    try {
        const chat = await Chats.findOne({ where: { chatId } });
        if (!chat) {
            throw new Error("Chat not found");
        }

        const updatedConversation = [...chat.conversation, { senderId, message, timestamp: new Date() }];
        await chat.update({ conversation: updatedConversation });
        const lastMessage = updatedConversation[updatedConversation.length - 1];

        const participants = await ChatUserRelation.findAll({ where: { chatId }, attributes: ['userId'] });
        multicastToUsers(participants.map(p => p.userId), {
            messageType: 'chatUpdate',
            data: {
                chatId,
                lastMessage
            }
        });
        return lastMessage;
    } catch (error) {
        console.error("Error updating chat:", error);
        throw error;
    }
}

module.exports = {
    getChats,
    createChat,
    updateChat
};
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

async function getChatById(chatId) {
    try {
        const chat = await Chats.findOne({ where: { chatId } });
        if (!chat) {
            throw new Error("Chat not found");
        }
        return chat;
    } catch (error) {
        console.error("Error fetching chat by ID:", error);
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
        multicastToUsers(participants, {
            messageType: 'chatCreated',
            messageId: nanoid(8),
            data: {
                chatId,
                participants
            }
        });
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

        const senderRelation = await ChatUserRelation.findOne({
            where: { chatId, userId: senderId }
        });
        if (!senderRelation) {
            throw new Error("User is not a member of this chat");
        }

        const lastMessage = {
            id: nanoid(8),
            senderId,
            message,
            timestamp: new Date().toISOString()
        };
        const updatedConversation = [
            ...(chat.conversation || []),
            lastMessage
        ];
        await chat.update({ conversation: updatedConversation });

        const participants = await ChatUserRelation.findAll({ where: { chatId }, attributes: ['userId'] });
        multicastToUsers(participants.map(p => p.userId), {
            messageType: 'chatUpdate',
            messageId: nanoid(8),
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
    getChatById,
    updateChat
};
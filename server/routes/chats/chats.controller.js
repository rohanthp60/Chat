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
                attributes: ['userId', 'firstName', 'middleName', 'lastName'],
            }],
            attributes: ['chatId', 'conversation', 'name', 'groupChat'],
         });

        const groupChats = chats.filter(chat => chat.groupChat);
        const directChats = chats.filter(chat => !chat.groupChat);

        const directChatIds = directChats.map(chat => chat.chatId);
        const directChatParticipants = await ChatUserRelation.findAll({
            where: {
                chatId: {
                    [Op.in]: directChatIds
                },
                userId: {
                    [Op.ne]: userId
                }
            },
            include: [{
                model: Users,
                as: 'user',
                attributes: ['userId', 'firstName', 'middleName', 'lastName']
            }],
            attributes: ['chatId', 'userId']
        });
        const directChatMap = directChatParticipants.reduce((acc, relation) => {
            const participant = relation.user;
            const name = participant
                ? [participant.firstName, participant.middleName, participant.lastName]
                    .filter(Boolean)
                    .join(" ")
                : relation.userId;
            acc[relation.chatId] = name || relation.userId;
            return acc;
        }, {});

        return [
            ...groupChats.map(chat => ({
                chatId: chat.chatId,
                name: chat.name || chat.chatId,
                conversation: chat.conversation || []
            })),
            ...directChats.map(chat => ({
                chatId: chat.chatId,
                name: directChatMap[chat.chatId] || chat.chatId,
                conversation: chat.conversation || []
            }))
        ];
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

async function createChat(chatDetails) {
    const { participants, name, groupChat } = chatDetails;
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
        await Chats.create({
            chatId,
            conversation: [],
            name,
            groupChat
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
                name,
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
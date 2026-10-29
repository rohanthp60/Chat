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
            groupChat,
            admin: chatDetails.admin
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
                participants,
                admin: chatDetails.admin,
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

function removeDuplicates(array) {
    return Array.from(new Set(array));
}

async function addParticipants(chatId, newParticipants, userId) {
    try {
        const chat  = await Chats.findOne({ where: { chatId } });
        if (!chat) {
            throw new Error("Chat not found");
        }

        const isAdmin = chat.admin === userId;
        if (!isAdmin) {
            throw new Error("Only the admin can add participants");
        }

        newParticipants = removeDuplicates(newParticipants);

        const existingParticipants = await Users.findAll({
            include: [{
                model: Chats,
                where: { chatId },
                attributes: []
            }],
            where: {
                userId: {
                    [Op.in]: newParticipants
                }
            },
            attributes: ['userId']
        });
        const existingUserIds = existingParticipants.map(u => u.userId);
        const participantsToAdd = newParticipants.filter(p => !existingUserIds.includes(p));
        
        if (!participantsToAdd.length) {
            throw new Error("No new participants to add");
        }

        await ChatUserRelation.bulkCreate(
            participantsToAdd.map((userId) => ({
                chatId,
                userId
            }))
        );

        multicastToUsers(participantsToAdd, {
            messageType: 'chatCreated',
            messageId: nanoid(8),
            data: {
                chatId,
                name: chat.name,
                addedBy: userId
            }
        });

    } catch (error) {
        console.error("Error adding participants:", error);
        throw error;
    }
}

async function removeParticipants(chatId, participantsToRemove, userId) {
    try {
        const chat  = await Chats.findOne({ where: { chatId } });
        if (!chat) {
            throw new Error("Chat not found");
        }

        const isAdmin = chat.admin === userId;
        const leavingSelf = participantsToRemove.length === 1 && participantsToRemove[0] === userId;
        if (!isAdmin && !leavingSelf) {
            throw new Error("Only the admin can remove participants or a user can leave the chat themselves");
        }
        if (!isAdmin) {
            throw new Error("Only the admin can remove participants");
        }

        participantsToRemove = removeDuplicates(participantsToRemove);

        await ChatUserRelation.destroy({
            where: {
                chatId,
                userId: {
                    [Op.in]: participantsToRemove
                }
            }
        });

        multicastToUsers(participantsToRemove, {
            messageType: 'chatRemoved',
            messageId: nanoid(8),
            data: {
                chatId,
                removedBy: userId
            }
        });

    } catch (error) {
        console.error("Error removing participants:", error);
        throw error;
    }
}

async function setAdmin(chatId, newAdminId, currentAdminId) {
    try {
        const chat  = await Chats.findOne({ where: { chatId } });
        if (!chat) {
            throw new Error("Chat not found");
        }

        if (chat.admin !== currentAdminId) {
            throw new Error("Only the current admin can set a new admin");
        }

        const isParticipant = await ChatUserRelation.findOne({
            where: { chatId, userId: newAdminId }
        });
        if (!isParticipant) {
            throw new Error("New admin must be a participant of the chat");
        }

        await chat.update({ admin: newAdminId });

        multicastToUsers([newAdminId], {
            messageType: 'adminChanged',
            messageId: nanoid(8),
            data: {
                chatId,
                newAdminId,
                changedBy: currentAdminId
            }
        });

    } catch (error) {
        console.error("Error setting new admin:", error);
        throw error;
    }
}

module.exports = {
    getChats,
    createChat,
    getChatById,
    updateChat,
    removeParticipants,
    addParticipants,
    setAdmin,
};
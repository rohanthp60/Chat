const { Chats, Users, ChatUserRelation } = require('../../database');
const { multicastToUsers, sendToUser } = require('../../websockets/controller');
const { nanoid } = require('nanoid');
const { Op } = require('sequelize');
const  _ = require('lodash');

async function getChats(userId) {
    try {
        const chats = await Chats.findAll({ 
            include: [{
                model: Users,
                where: { userId },
                attributes: ['userId', 'firstName', 'middleName', 'lastName'],
            }],
            attributes: ['chatId', 'admin', 'name', 'groupChat'],
         });

        const groupChats = chats.filter(chat => chat.groupChat);
        const directChats = chats.filter(chat => !chat.groupChat);

        const directChatUserRelations = await ChatUserRelation.findAll({
            where: {
                chatId: {
                    [Op.in]: directChats.map(chat => chat.chatId),
                },
                userId
            },
            attributes: ['chatId', 'name']
        });


        const directChatName = _.fromPairs(
            directChatUserRelations.map(relation => [relation.chatId, relation.name])
        )

        return [
            ...groupChats,
            ...directChats.map(chat => ({
                ...chat.toJSON(),
                name: directChatName[chat.chatId] || "Unnamed chat"
            }))
        ]

    } catch (error) {
        console.error("Error fetching chat:", error);
        throw error;
    }
}

async function getChatById(chatId, userId) {
    try {
        let chat = await Chats.findOne({ where: { chatId } });
        if (!chat) {
            throw new Error("Chat not found");
        }
        chat = chat.dataValues;
        if (!chat.groupChat) {
            const userRelations = await ChatUserRelation.findOne({
                where: { chatId, userId },
                attributes: ['name']
            });
            if (!userRelations) {
                throw new Error("User is not a member of this chat");
            }
            chat.name = userRelations.name;
        }
        return chat;
    } catch (error) {
        console.error("Error fetching chat by ID:", error);
        throw error;
    }
}

async function getParticipants(chatId) {
    try {
        const participants = await Users.findAll({
            include: [{
                model: Chats,
                where: { chatId },
                attributes: []
            }],
            attributes: ['userId', 'firstName', 'middleName', 'lastName']
        });
        return participants.map(p => p.dataValues);
    } catch (error) {
        console.error("Error fetching chat participants:", error);
        throw error;
    }
}


async function createChat(chatDetails) {
    let { participants, name, groupChat } = chatDetails;
    try {
        const usersResponse = await Users.findAll({
            where: {
                userId: {
                    [Op.in]: participants
                }
            },
            attributes: ['userId', 'firstName', 'middleName', 'lastName']
        });
        const userIds = usersResponse.map(u => u.userId);

        const getFullName = (firstName, middleName, lastName) => {
            let fullName = firstName + " ";
            if (middleName) {
                fullName += middleName + " ";
            }
            fullName += lastName;
            return fullName.trim();
        }

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

        let chatUserRelationEntries = participants.map(userId => ({ chatId, userId }))
        if (!groupChat) {
            const otherUserIds = chatUserRelationEntries.map(entry => entry.userId)
            for (let i = 0; i < 2; i++) {
                const otherUserId = otherUserIds[1 - i];
                const otherUser = usersResponse.find(u => u.userId === otherUserId);
                const otherUserFullName = getFullName(otherUser.firstName, otherUser.middleName, otherUser.lastName);
                chatUserRelationEntries[i].name = otherUserFullName;
            }
        }
        await ChatUserRelation.bulkCreate(
            chatUserRelationEntries
        );

        let websocketResponse = {
            messageType: 'chatCreated',
            messageId: nanoid(8),
            data: {
                chatId
            }
        }
        if (groupChat) {
            websocketResponse.data.name = name;
            websocketResponse.data.admin = chatDetails.admin;
            multicastToUsers(participants, websocketResponse);
        } else {
            for (let i = 0; i < 2; i++) {
                websocketResponse.data.name = chatUserRelationEntries[i].name;
                sendToUser(chatUserRelationEntries[i].userId, websocketResponse);
            }
        }
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
            attributes: ['userId', 'firstName', 'middleName', 'lastName']
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

        const updatedParticipants = await Users.findAll({
            include: [{
                model: Chats,
                where: { chatId },
                attributes: []
            }],
            attributes: ['userId', 'firstName', 'middleName', 'lastName']
        });
        const updatedUserIds = updatedParticipants.map(p => p.userId);

        multicastToUsers(updatedUserIds.map(x => x.userId), {
            messageType: 'chatParticipantsUpdated',
            messageId: nanoid(8),
            data: {
                chatId,
                participants: updatedUserIds
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
        

        participantsToRemove = removeDuplicates(participantsToRemove);

        await ChatUserRelation.destroy({
            where: {
                chatId,
                userId: {
                    [Op.in]: participantsToRemove
                }
            }
        });

        const existingParticipants = await ChatUserRelation.findAll({
            where: { chatId },
            attributes: ['userId']
        });
        const remainingUserIds = existingParticipants.map(p => p.userId);

        multicastToUsers(participantsToRemove, {
            messageType: 'chatRemoved',
            messageId: nanoid(8),
            data: {
                chatId,
                removedBy: userId
            }
        });

        const updatedParticipants = await Users.findAll({
            include: [{
                model: Chats,
                where: { chatId },
                attributes: []
            }],
            attributes: ['userId', 'firstName', 'middleName', 'lastName']
        });
        const updatedUserIds = updatedParticipants.map(p => p.userId);

        multicastToUsers(updatedUserIds, {
            messageType: 'chatParticipantsUpdated',
            messageId: nanoid(8),
            data: {
                chatId,
                participants: updatedParticipants
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
    getParticipants
};
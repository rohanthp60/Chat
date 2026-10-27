const { DataTypes, Model } = require('sequelize');
const UsersObject = require('./models/users');
const ChatsObject = require('./models/chats');
const ChatUserRelationObject = require('./models/chatUserRelation');
const sequelize = require('./init');

const Users = UsersObject(DataTypes, Model, sequelize);
const Chats = ChatsObject(DataTypes, Model, sequelize);
const ChatUserRelation = ChatUserRelationObject(DataTypes, Model, sequelize);

Users.belongsToMany(Chats, {
    through: ChatUserRelation,
    foreignKey: "userId",
    otherKey: "chatId",
    sourceKey: "userId",
    targetKey: "chatId"
});

Chats.belongsToMany(Users, {
    through: ChatUserRelation,
    foreignKey: "chatId",
    otherKey: "userId",
    sourceKey: "chatId",
    targetKey: "userId"
});

ChatUserRelation.belongsTo(Users, {
    foreignKey: "userId",
    targetKey: "userId",
    as: "user"
});

ChatUserRelation.belongsTo(Chats, {
    foreignKey: "chatId",
    targetKey: "chatId",
    as: "chat"
});

const checkDBConnection = async () => {
    try {
        await sequelize.authenticate();
    } catch (error) {
        throw error;
    }
}
const closeDatabase = () => sequelize.close();

module.exports = {
    Users,
    Chats,
    ChatUserRelation,
    checkDBConnection,
    closeDatabase
};
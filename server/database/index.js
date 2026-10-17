const { DataTypes, Model } = require('sequelize');
const UsersObject = require('./models/users');
const ChatsObject = require('./models/chats');
const ChatUserRelationObject = require('./models/chatUserRelation');
const sequelize = require('./init');

const Users = UsersObject(DataTypes, Model, sequelize);
const Chats = ChatsObject(DataTypes, Model, sequelize);
const ChatUserRelation = ChatUserRelationObject(DataTypes, Model, sequelize);
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
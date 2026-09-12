const { DataTypes, Model } = require('sequelize');
const UsersObject = require('./models/users');
const sequelize = require('./init');

const Users = UsersObject(DataTypes, Model, sequelize);
const checkDBConnection = async () => {
    try {
        await sequelize.authenticate();
    } catch (error) {
        throw error;
    }
}

module.exports = {
    Users,
    checkDBConnection
};
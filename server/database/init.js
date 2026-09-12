const { Sequelize } = require('sequelize');

const databaseName = 'SchoolManagementApp';
const user = 'postgres';
const password = 'rohan2060';

const sequelize = new Sequelize(
    databaseName,
    user,
    password,
    {
        host: "localhost",
        dialect: "postgres"
    }
);

module.exports = sequelize;

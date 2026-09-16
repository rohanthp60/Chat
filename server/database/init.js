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
        dialect: "postgres",
        logging: false
    }
);

module.exports = sequelize;

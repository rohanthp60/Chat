const { Sequelize } = require('sequelize');
require("dotenv").config();

const commonOptions = {
    dialect: "postgres",
    logging: false,
    define: {
        schema: "public",
    },
};

let sequelize;

if (process.env.DATABASE_URL) {
    // Neon / production
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        ...commonOptions,
        dialectOptions: {
            ssl: { require: true, rejectUnauthorized: false },
        },
    });
} else {
    // Local Docker Postgres
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            ...commonOptions,
            host: process.env.DB_HOST || "localhost",
            port: Number.parseInt(process.env.DB_PORT, 10) || 5432,
        }
    );
}

module.exports = sequelize;
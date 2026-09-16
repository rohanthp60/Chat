const { Users } = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");

const saltRounds = 10;
const jwtSignKey = "secure";

async function logIn(userId, password) {
    let userResolved = false;
    let token = null;
    
    const dbResponse = await Users.findOne({
        where: {
            uid: userId,
        }
    });


    if (dbResponse) {
        const storedPasswordHash = dbResponse.passwordHash;
        const match = await bcrypt.compare(password, storedPasswordHash);
        userResolved = match;
    }


    if (userResolved) {
        token = jwt.sign(dbResponse.dataValues, jwtSignKey, {expiresIn: '24h'});
    }

    return token;
}

async function register(userDetails, token) {
    const decoded = jwt.verify(token, jwtSignKey);
    if (decoded?.role !== 'admin') {
        return;
    }
    const password = nanoid(8);
    const userId = `user-${nanoid(4)}`;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    try {
        await Users.create({
            ...userDetails,
            uid: userId,
            passwordHash
        });
        return { userId, password };
    } catch(error) {
        console.error(error);
    }
}

module.exports = { logIn, register };


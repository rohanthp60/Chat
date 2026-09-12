const { Users } = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const jwtSignKey = "secure";

async function logIn(userId, password) {
    let userResolved = false;
    let token = null;
    
    let { dbResponse } = await Users.findOne({
        where: {
            uid: userId,
        }
    });


    if (dbResponse) {
        const storedPasswordHash = dbResponse.passwordHash;
        const match = bcrypt.compare(password, storedPasswordHash);
        userResolved = match;
    }

    if (userResolved) {
        token = jwt.sign(dbResponse.dataValues, jwtSignKey, {expiresIn: '24h'});
    }

    return token;
}

module.exports = { logIn };


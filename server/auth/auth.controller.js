const { Users } = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = Number.parseInt(process.env.SALT_ROUNDS, 10) || 10;
const jwtSignKey = process.env.JWT_SIGN_KEY;

async function logIn(userId, password) {
    let userResolved = false;
    let token = null;
    
    const dbResponse = await Users.findOne({
        where: {
            userId: userId,
        }
    });


    if (dbResponse) {
        const storedPasswordHash = dbResponse.passwordHash;
        const match = await bcrypt.compare(password, storedPasswordHash);
        userResolved = match;
    }


    if (userResolved) {
        token = jwt.sign(dbResponse.dataValues, jwtSignKey, {expiresIn: '3h'});
    }

    return token;
}

async function register(userDetails) {
    const { password } = userDetails;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    try {
        const newUser = await Users.create({
            ...userDetails,
            passwordHash: passwordHash
        });
        return newUser;
    } catch (error) {
        console.error("Error creating user:", error);
    }
}

module.exports = { logIn, register };

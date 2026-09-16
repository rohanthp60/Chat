const { after, afterEach, test } = require("node:test");
const assert = require("node:assert");
const { logIn, register } = require("./auth.controller");
const { Users, closeDatabase } = require("../database");

after(() => closeDatabase());
const createdUserIds = new Set();

afterEach(async () => {
    if (createdUserIds.size > 0) {
        await Users.destroy({
            where: {
                uid: [...createdUserIds]
            }
        });
        createdUserIds.clear();
    }
});



const adminId = "FyfMCnIC";
const adminPassword = "rohan2060";


test("existing user can log in", 
    async () => {
        const token = await logIn(adminId, adminPassword);
        assert.notStrictEqual(token, null);
    }
);

test("existing user with invalid password can't login",
    async () => {
        const token = await logIn(adminId, "wompwomp");
        assert.strictEqual(token, null);
    }
);

test("existing user with invalid userId can't login",
    async () => {
        const token = await logIn("wompwomp", adminPassword);
        assert.strictEqual(token, null);
    }
);

test("admin can create new user", 
    async () => {
        const token = await logIn(adminId, adminPassword);
        const userDetails = {
            firstName: "Shiva",
            lastName: "Thapa",
            dateOfBirth: "2003-12-11",
            joinedSince: "2020-01-01",
            role: "student",
            gender: "male",
        };
        const credentials = await register(userDetails, token);
        createdUserIds.add(credentials.userId);
        assert.notStrictEqual(credentials?.userId, undefined);
        assert.notDeepStrictEqual(credentials?.password, undefined);
    }
)

test("newly created user can logIn",
    async () => {
        const token = await logIn(adminId, adminPassword);
        const userDetails = {
            firstName: "Shiva",
            lastName: "Thapa",
            dateOfBirth: "2003-12-11",
            joinedSince: "2020-01-01",
            role: "student",
            gender: "male",
        };
        const { userId, password } = await register(userDetails, token);
        createdUserIds.add(userId);
        const userToken = await logIn(userId, password);
        assert.notStrictEqual(userToken, null);
    }
);


test("other user than admin can't add new users",
    async () => {
        const token = await logIn(adminId, adminPassword);
        const userDetails = {
            firstName: "Shiva",
            lastName: "Thapa",
            dateOfBirth: "2003-12-11",
            joinedSince: "2020-01-01",
            role: "student",
            gender: "male",
        };
        const { userId, password } = await register(userDetails, token);
        createdUserIds.add(userId);
        const userToken = await logIn(userId, password);
        const dbResponse = await register(userDetails, userToken);
        assert.strictEqual(dbResponse, undefined);
    }
)
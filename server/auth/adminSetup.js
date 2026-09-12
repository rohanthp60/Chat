const bcrypt = require("bcrypt");
const { nanoid } = require("nanoid");
const { Users } = require("../database")

const adminPassword = "rohan2060";
const saltRounds = 10;

async function setupAdmin() {
    let dbResponse = await Users.findOne({
        where: {
            role: "admin"
        }
    });

    if (dbResponse) {
        console.log("Admin role already exists!", dbResponse);
    }

    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
    console.log({ passwordHash });
    const response = await Users.create({
        uid: nanoid(8),
        firstName: "Rohan",
        lastName: "Thapa",
        dateOfBirth: "2003-12-11",
        joinedSince: "2020-01-01",
        role: "admin",
        gender: "male",
        passwordHash
    });
    console.log("Admin user created", response);
}

setupAdmin();
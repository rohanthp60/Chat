const { Users } = require("../../database");

async function getContacts() {
    try {
        const contacts = await Users.findAll({
            attributes: ['userId', 'firstName', 'lastName']
        });
        return contacts;
    } catch (error) {
        console.error("Error fetching contacts:", error);
        throw error;
    }
}

module.exports = getContacts;
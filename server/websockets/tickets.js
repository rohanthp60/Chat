const crypto = require("crypto");

const tickets = new Map();
const ticketExpiryTime = 1800000; // 30 minutes

function getTicket(userId) {
    const ticketString = crypto.randomBytes(16).toString("hex");
    const ticket = {
        ticket: ticketString,
        createdAt: Date.now(),
        userId: userId
    };
    tickets.set(ticketString, ticket);
    return ticket;
}

function validateTicket(ticketString) {
    const ticket = tickets.get(ticketString);
    if (!ticket) {
        return false;
    }
    const currentTime = Date.now();
    if (currentTime - ticket.createdAt > ticketExpiryTime) {
        tickets.delete(ticketString);
        return false;
    }
    tickets.delete(ticketString);
    return ticket.userId;
}

module.exports = { getTicket, validateTicket };
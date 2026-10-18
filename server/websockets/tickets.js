const crypto = require("crypto");

let tickets = new Map();
let ticketExpiryTime = 1800000 // 30 seconds

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
        return null;
    }
    tickets.delete(ticketString);
    return ticket.userId;
}

module.exports = { getTicket, validateTicket };
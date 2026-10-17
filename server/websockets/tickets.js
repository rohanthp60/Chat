const crypto = require("crypto");

let tickets = new Map();
let ticketExpiryTime = 30000 // 30 seconds

function getTicket() {
    const ticketString = crypto.randomBytes(16).toString("hex");
    const ticket = {
        ticket: ticketString,
        createdAt: Date.now()
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
    return true;
}

module.exports = { getTicket, validateTicket };
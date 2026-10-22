import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

async function getTicket(token) {
    const response = await axios.get(`${apiBaseUrl}/api/websockets/get-ticket`, {
        headers: {
                Authorization: `Bearer ${token}`
        }
    });
    return response.data.ticket.ticket;
}

export default getTicket;

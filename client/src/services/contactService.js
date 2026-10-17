import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

async function getContacts(token) {
    try {
        const response = await axios.get(`${apiBaseUrl}/api/contacts`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.contacts;
    } catch (error) {
        console.error("Error fetching contacts:", error);
        throw error;
    }
}

export default getContacts;
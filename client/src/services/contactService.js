import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

export const getContacts = async (token) => {
    try {
        const response = await axios.get(`${apiBaseUrl}/api/contacts`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching contacts:", error);
        throw error;
    }
}
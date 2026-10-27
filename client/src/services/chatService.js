import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

const authHeaders = token => ({
    headers: {
        Authorization: `Bearer ${token}`
    }
});

export const createChat = async (token, chatDetails) => {
    try {
        const response = await axios.post(
            `${apiBaseUrl}/api/chats/`,
            chatDetails,
            authHeaders(token)
        );
        console.log("Chat created:", response);
        return response.data;
    } catch (error) {
        console.error("Error creating chat:", error);
    }
};

export const getChats = async token => {
    try {
        const response = await axios.get(`${apiBaseUrl}/api/chats/`, authHeaders(token));
        return response.data;
    } catch (error) {
        console.error("Error fetching chats:", error);
    }
};

export const getChatById = async (token, chatId) => {
    try {
        const response = await axios.get(
            `${apiBaseUrl}/api/chats/${chatId}`,
            authHeaders(token)
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching chat by ID:", error);
    }
};
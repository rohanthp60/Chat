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

export const getParticipants = async (token, chatId) => {
    try {
        const response = await axios.get(
            `${apiBaseUrl}/api/chats/${chatId}/participants`,
            authHeaders(token)
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching participants:", error);
    }
};

export const addParticipantsToChat = async (token, chatId, participants) => {
    try {
        const response = await axios.post(
            `${apiBaseUrl}/api/chats/${chatId}/participants`,
            { participants },
            authHeaders(token)
        );
        return response.data;
    } catch (error) {
        console.error("Error adding participants to chat:", error);
    }
}

export const removeParticipantsFromChat = async (token, chatId, participants) => {
    try {
        const response = await axios.delete(
            `${apiBaseUrl}/api/chats/${chatId}/participants`,
            {
                ...authHeaders(token),
                data: { participants }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error removing participants from chat:", error);
    }
}

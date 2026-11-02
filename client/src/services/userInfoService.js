import axios from "axios";
const apiBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

async function getUserInfo(token) {
    const response = await axios.get(`${apiBaseUrl}/api/userInfo`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data.user;
}

export default getUserInfo;
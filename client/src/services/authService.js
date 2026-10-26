import axios from "axios"
import { useState } from "react";
const apiBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;


export function useAuthenticate(register=false) {
    const [requestPhase, setRequestPhase] = useState({
        goingOn: false,
        completed: false,
        success: false,
        message: null,
        token: null
    });

    const authenitcate = async (userDetails) => {
        setRequestPhase(prevState => ({...prevState, goingOn: true}));
        try {
            const filteredUserDetails = Object.fromEntries(
                Object.entries(userDetails).filter(([, value]) => value !== "")
            );
            const response = await axios.post(`${apiBaseUrl}/auth/${register ? 'register' : 'login'}`, filteredUserDetails);
            console.log(response);
            const data = response.data;
            setRequestPhase(prevState => ({
                goingOn: false,
                completed: true,
                success: data.success,
                token: data.token ?? null,
                message: data.message ?? null
            }));
            return data;
        } catch (error) {
            setRequestPhase(prevState => ({
                goingOn: false,
                completed: true,
                success: false,
                token: null,
                message: error.response?.data?.message ??
                         "Error occured while processing log-in request!"
            }));
            return null;
        }
    }

    return {...requestPhase, authenitcate};
}

export const validToken = async (token) => {
    if (!token) return false;
    try {
        const response = await axios.get(`${apiBaseUrl}/api/chats/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.status === 200;
    } catch (error) {
        console.error("Error validating token:", error);
        return false;
    }
}

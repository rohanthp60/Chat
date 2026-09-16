import axios from "axios"
import { useState } from "react";
const apiBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;


export function useLogIn() {
    const [requestPhase, setRequestPhase] = useState({
        goingOn: false,
        completed: false,
        success: false,
        message: null,
        token: null
    });

    const login = async (userId, password) => {
        setRequestPhase(prevState => ({...prevState, goingOn: true}));
        console.log(`${apiBaseUrl}/auth/login`);
        try {
            const response = await axios.post(`${apiBaseUrl}/auth/login`, {
                userId, password
            });
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

    return {...requestPhase, login};
}


import { useCallback, useMemo, useState } from "react";
import { useConnectSocket } from "../services/websocket";
import { AppContext } from "./appContext";

export const AppProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const { subscribe, sendMessage, connectionState } = useConnectSocket(token);

    const updateToken = useCallback(nextToken => {
        setToken(nextToken);
        if (nextToken) {
            localStorage.setItem("token", nextToken);
        } else {
            localStorage.removeItem("token");
        }
    }, []);

    const value = useMemo(
        () => ({ token, setToken: updateToken, subscribe, sendMessage, connectionState }),
        [token, updateToken, subscribe, sendMessage, connectionState]
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

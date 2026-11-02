import { useCallback, useMemo, useState, useEffect } from "react";
import { useConnectSocket } from "../services/websocket";
import { AppContext } from "./appContext";
import getUserInfo from "../services/userInfoService";

export const AppProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token") || null);
    const { subscribe, sendMessage, connectionState, breakConnection } = useConnectSocket(token);
    const [userDetail, setUserDetail] = useState(null);

    useEffect(() => {
        if (token) {
            getUserInfo(token).then(res => {
                setUserDetail(res);
            });
        }
    }, [token]);
    const updateToken = useCallback(nextToken => {
        setToken(nextToken);
        if (nextToken) {
            localStorage.setItem("token", nextToken);
        } else {
            localStorage.removeItem("token");
        }
    }, []);

    const value = useMemo(
        () => ({ token, setToken: updateToken, userDetail, subscribe, sendMessage, connectionState, breakConnection }),
        [token, updateToken, userDetail, subscribe, sendMessage, connectionState, breakConnection]
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

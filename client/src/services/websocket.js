import { useCallback, useEffect, useRef, useState } from "react";
import getTicket from "./getTicketService";

const getWebsocketUrl = apiBaseUrl => {
    const url = new URL(apiBaseUrl);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = "/ws";
    url.search = "";
    return url;
};

export const useConnectSocket = (token) => {
    const socketRef = useRef(null);
    const listenersRef = useRef(new Set());
    const [connectionState, setConnectionState] = useState(
        token ? "connecting" : "disconnected"
    );

    useEffect(() => {
        let cancelled = false;
        let retryTimer = null;
        let retryDelay = 1000;

        if (!token) {
            return () => {
                cancelled = true;
            };
        }

        const scheduleReconnect = () => {
            if (cancelled || retryTimer) {
                return;
            }

            const jitter = Math.random() * 250;
            retryTimer = setTimeout(() => {
                retryTimer = null;
                connect();
            }, retryDelay + jitter);
            retryDelay = Math.min(retryDelay * 2, 30000);
        };

        const connect = async () => {
            try {
                setConnectionState("connecting");
                const ticket = await getTicket(token);
                if (cancelled) {
                    return;
                }

                const socketUrl = getWebsocketUrl(import.meta.env.VITE_BACKEND_BASE_URL);
                socketUrl.searchParams.set("token", ticket);
                const socket = new WebSocket(socketUrl);
                socketRef.current = socket;

                socket.addEventListener("open", () => {
                    retryDelay = 1000;
                    setConnectionState("connected");
                });

                socket.addEventListener("message", event => {
                    try {
                        const data = JSON.parse(event.data);
                        if (
                            data === null ||
                            typeof data !== "object" ||
                            Array.isArray(data) ||
                            typeof data.messageType !== "string"
                        ) {
                            console.warn("Dropping invalid WebSocket message:", data);
                            return;
                        }

                        listenersRef.current.forEach(listener => {
                            try {
                                listener(data);
                            } catch (error) {
                                console.error("WebSocket message listener failed:", error);
                            }
                        });
                    } catch (error) {
                        console.error("Unable to parse WebSocket message:", error);
                    }
                });

                socket.addEventListener("error", error => {
                    console.error("WebSocket connection error:", error);
                    setConnectionState("error");
                });

                socket.addEventListener("close", () => {
                    if (!cancelled) {
                        setConnectionState("reconnecting");
                        scheduleReconnect();
                    }
                });
            } catch (error) {
                if (!cancelled) {
                    console.error("Unable to create WebSocket ticket:", error);
                    setConnectionState("error");
                }
            }
        };

        connect();

        return () => {
            cancelled = true;
            if (retryTimer) {
                clearTimeout(retryTimer);
                retryTimer = null;
            }
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [token]);

    const subscribe = useCallback(handler => {
        listenersRef.current.add(handler);
        return () => listenersRef.current.delete(handler);
    }, []);

    const sendMessage = useCallback(message => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(message));
            return true;
        }

        console.error("WebSocket is not open. Unable to send message.");
        return false;
    }, []);

    const breakConnection = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
    }, []);
    return {
        subscribe,
        sendMessage,
        breakConnection,
        connectionState: token ? connectionState : "disconnected"
    };
};

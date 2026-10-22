import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useApp } from "../../contexts/appContext";
import { getChatById } from "../../services/chatService";
import styles from "./Chat.module.css";

const getMessageKey = message => (
    message.id || `${message.senderId}|${message.timestamp}|${message.message}`
);

const mergeMessages = (existing, incoming) => {
    const messagesByKey = new Map();
    [...existing, ...incoming].forEach(message => {
        messagesByKey.set(getMessageKey(message), message);
    });
    return [...messagesByKey.values()]
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

const Chat = ({ chatId }) => {
    const [text, setText] = useState("");
    const { token, subscribe, sendMessage, connectionState } = useApp();
    const [messages, setMessages] = useState([]);

    useEffect(() => subscribe(message => {
        if (message.messageType === "error") {
            toast.error(message.data?.message || "WebSocket error");
            return;
        }
        if (message.messageType !== "chatUpdate" || message.data?.chatId !== chatId) return;
        const incoming = message.data.lastMessage;
        if (incoming) {
            setMessages(previous => mergeMessages(previous, [incoming]));
        }
    }), [subscribe, chatId]);

    useEffect(() => {
        let cancelled = false;

        const fetchChat = async () => {
            try {
                const chatData = await getChatById(token, chatId);
                if (cancelled) return;
                if (chatData?.success) {
                    setMessages(previous =>
                        mergeMessages(chatData.chat.conversation || [], previous)
                    );
                } else {
                    console.error("Failed to fetch chat:", chatData);
                }
            } catch (error) {
                if (!cancelled) {
                    console.error("Error fetching chat:", error);
                }
            }
        };
        fetchChat();
        return () => {
            cancelled = true;
        };
    }, [chatId, token]);

    const sendMessageHandler = event => {
        event.preventDefault();
        if (!text.trim()) return;
        const sent = sendMessage({
            messageType: "chatMessage",
            data: { chatId, message: text.trim() }
        });
        if (sent) setText("");
    };

    return (
        <div className={styles.panel}>
            <div className={styles.messages}>
                {messages.map(message => (
                <div className={styles.message} key={getMessageKey(message)}>
                    <strong>{message.senderId}:</strong> {message.message}{" "}
                    <em className={styles.messageMeta}>
                        ({new Date(message.timestamp).toLocaleString()})
                    </em>
                </div>
                ))}
            </div>
            {connectionState !== "connected" && (
                <p>Chat is currently {connectionState}.</p>
            )}
            <form className={styles.composer} onSubmit={sendMessageHandler}>
                <input
                    className={styles.input}
                    type="text"
                    value={text}
                    onChange={event => setText(event.target.value)}
                />
                <button className={styles.button} type="submit">Send</button>
            </form>
        </div>
    );
};

export default Chat;

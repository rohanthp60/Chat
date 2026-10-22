import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useApp } from "../../contexts/appContext";
import { getChats } from "../../services/chatService";
import Chat from "./Chat";
import styles from "./Chat.module.css";

const ChatList = () => {
    const { token, subscribe } = useApp();
    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const chatResponse = await getChats(token);
                console.log("Fetched chats:", chatResponse);
                setChats(chatResponse.chats || []);
            } catch (error) {
                console.error("Error fetching chats:", error);
            }
        };
        fetchChats();
    }, [token]);

    useEffect(() => subscribe(message => {
        if (message.messageType === "error") {
            toast.error(message.data?.message || "WebSocket error");
            return;
        }
        if (message.messageType !== "chatCreated") return;
        console.log("Received chatCreated message:", message);
        const chatId = message.data?.chatId;
        if (chatId) {
            setChats(previous => (
                previous.some(chat => chat.chatId === chatId)
                    ? previous
                    : [...previous, { chatId, conversation: [] }]
            ));
        }
    }), [subscribe]);

    return (
        <div className={styles.workspace}>
            <aside className={styles.sidebar}>
                <h3 className={styles.sidebarTitle}>Chats</h3>
                <ul className={styles.chatList}>
                    {chats.map(chat => (
                        <li key={chat.chatId}>
                            <button
                                type="button"
                                onClick={() => setSelectedChatId(chat.chatId)}
                                className={`${styles.chatItem} ${
                                    selectedChatId === chat.chatId ? styles.chatItemActive : ""
                                }`}
                            >
                                Chat ID: {chat.chatId}
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>
            <section className={styles.conversation}>
                {selectedChatId ? (
                    <Chat key={selectedChatId} chatId={selectedChatId} />
                ) : (
                    <div className={styles.emptyState}>
                        <h3>Select a chat</h3>
                        <p>Choose a conversation from the chat list to get started.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default ChatList;

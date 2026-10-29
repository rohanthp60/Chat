import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useApp } from "../../contexts/appContext";
import { getChats } from "../../services/chatService";
import Chat from "./Chat";
import ChatListItem from "./ChatListItem";
import styles from "./Chat.module.css";

const ChatList = () => {
    const { token, subscribe } = useApp();
    const [chats, setChats] = useState([]);
    const [selectedChatId, setSelectedChatId] = useState(null);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const chatResponse = await getChats(token);
                setChats(chatResponse.chats.map(chat => ({chatId: chat.chatId, name: chat.name})) || []);
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
        const chatId = message.data?.chatId;
        if (!chatId) return;

        if (message.messageType === "chatCreated") {
            setChats(previous => (
                previous.some(chat => chat.chatId === chatId)
                    ? previous
                    : [...previous, { chatId, name: message.data?.name }]
            ));
        } else if (message.messageType === "chatRemoved") {
            setChats(previous => (
                previous.filter(chat => chat.chatId !== chatId)
            ));
            if (selectedChatId === chatId) {
                setSelectedChatId(null);
            }
        }

    }), [subscribe]);

    return (
        <div className={styles.workspace}>
            <aside className={styles.sidebar}>
                <h3 className={styles.sidebarTitle}>Chats</h3>
                <ul className={styles.chatList}>
                    {chats.map(chat => (
                        <ChatListItem
                            key={chat.chatId}
                            chatId={chat.chatId}
                            name={chat.name}
                            isSelected={selectedChatId === chat.chatId}
                            onSelect={setSelectedChatId}
                        />
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

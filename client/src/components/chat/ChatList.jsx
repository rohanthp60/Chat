import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useApp } from "../../contexts/appContext";
import { getChats, markChatAsSeen } from "../../services/chatService";
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
                setChats(chatResponse.chats
                .map(chat => ({chatId: chat.chatId, 
                    name: chat.name,
                    unSeen: chat.unSeen,
                    lastMessageTimestamp: new Date(chat.lastMessageTimestamp)})) || []
                .sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0)));
            } catch (error) {
                console.error("Error fetching chats:", error);
            }
        };
        fetchChats();
    }, [token]);



    useEffect(() => subscribe((message) => {
        if (message.messageType === "error") {
            toast.error(message.data?.message || "WebSocket error");
            return;
        }
        const chatId = message.data?.chatId;
        if (!chatId) return;

        if (message.messageType === "chatCreated") {
            setChats(previous => {
                const nextChat = {
                    chatId,
                    name: message.data?.name,
                    lastMessageTimestamp: new Date(
                        message.data?.lastMessageTimestamp || Date.now()
                    )
                };
                return [
                    nextChat,
                    ...previous.filter(chat => chat.chatId !== chatId)
                ];
            });
        } else if (message.messageType === "chatRemoved") {
            setChats(previous => (
                previous.filter(chat => chat.chatId !== chatId)
            ));
            if (selectedChatId === chatId) {
                setSelectedChatId(null);
            }
        } else if (message.messageType === "chatRenamed") {
            setChats(previous => (
                previous.map(chat => (
                    chat.chatId === chatId
                        ? { ...chat, name: message.data?.newName }
                        : chat
                ))
            ));
        } else if (message.messageType === "chatUpdate") {
            const isSelectedChat = selectedChatId === chatId;
            if (isSelectedChat) {
                markChatAsSeen(token, chatId).catch(error => {
                    console.error("Error marking chat as seen:", error);
                });
            }
            setChats(previous =>{
                const nextChats = previous.filter(chat => chat.chatId !== chatId);
                let newChat = previous.find(chat => chat.chatId === chatId) || { chatId, name: message.data?.name };
                const timestamp = message.data?.lastMessage?.timestamp
                    || message.data?.lastMessageTimestamp
                    || Date.now();
                newChat = {
                    ...newChat,
                    lastMessageTimestamp: new Date(timestamp),
                    unSeen: isSelectedChat ? false : message.data?.unSeen || false
                };
                return [newChat, ...nextChats];
            });
        }

    }), [subscribe, selectedChatId, token]);

    const chatListItemClickHandler = async (chatId) => {
        setSelectedChatId(chatId);
        const unSeenStatus = chats.find(chat => chat.chatId === chatId)?.unSeen;
        if (!unSeenStatus) return;
        try {
            await markChatAsSeen(token, chatId);
            setChats(previous => (
                previous.map(chat => (
                    chat.chatId === chatId
                        ? { ...chat, unSeen: false }
                        : chat
                ))
            )); 
        } catch (error) {
            console.error("Error marking chat as seen:", error);
        }
    };

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
                            unSeen={chat.unSeen}
                            isSelected={selectedChatId === chat.chatId}
                            onSelect={chatListItemClickHandler}
                        />
                    ))}
                </ul>
            </aside>
            <section className={styles.conversation}>
                {selectedChatId ? (
                    <Chat key={selectedChatId} chatId={selectedChatId} setChats={setChats} />
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

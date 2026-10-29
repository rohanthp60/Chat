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

const MenuOptions = ({options}) => {
    return (
        <div className={styles.menuContainer}>
            <ul className={styles.menu}>
                {options.map((option, index) => (
                    <li key={index}>
                        <button
                            type="button"
                            onClick={option.onClick}
                            className={styles.menuItem}
                        >
                            {option.label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

const Chat = ({ chatId }) => {
    const [text, setText] = useState("");
    const { token, subscribe, sendMessage, connectionState, userDetail } = useApp();
    const [messages, setMessages] = useState([]);
    const [menuOptions, setMenuOptions] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);

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
                    const isGroupChat = chatData.chat.groupChat || false;
                    const isAdmin = chatData.chat.admin === userDetail?.userId;
                    let options = [];
                    if (isGroupChat) {
                        options = [{
                            label: "Leave Chat",
                            onClick: () => alert("Leave chat functionality not implemented yet")
                        }];
                        if (isAdmin) {
                            options.push({
                                label: "Add Participants",
                                onClick: () => alert("Add participants functionality not implemented yet")
                            });
                            options.push({
                                label: "Remove Participants",
                                onClick: () => alert("Remove participants functionality not implemented yet")
                            }); 
                        }
                    }
                    setMenuOptions(options);
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
            <div className={styles.menuWrapper}>
                <button
                    type="button"
                    className={styles.menuButton}
                    aria-expanded={menuOpen}
                    aria-label="Chat options"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    ...
                </button>
                {menuOpen && <MenuOptions options={menuOptions} />}
            </div>
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

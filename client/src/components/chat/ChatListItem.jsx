import styles from "./Chat.module.css";
import { useEffect } from "react";

const ChatListItem = ({ chatId, name, isSelected, onSelect }) => {
    const chatName = name?.trim() || "Unnamed chat";
    useEffect(() => {
        return () => {
            onSelect(null);
        };
    }, [onSelect]);


    return (
        <li>
            <button
                type="button"
                onClick={() => onSelect(chatId)}
                className={`${styles.chatItem} ${isSelected ? styles.chatItemActive : ""}`}
                aria-label={`Open ${chatName}`}
            >
                {chatName}
            </button>
        </li>
    );
};

export default ChatListItem;

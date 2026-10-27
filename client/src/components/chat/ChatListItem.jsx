import styles from "./Chat.module.css";

const ChatListItem = ({ chat, isSelected, onSelect }) => {
    const chatName = chat.name?.trim() || "Unnamed chat";
    console.log(chat);

    return (
        <li>
            <button
                type="button"
                onClick={() => onSelect(chat.chatId)}
                className={`${styles.chatItem} ${isSelected ? styles.chatItemActive : ""}`}
                aria-label={`Open ${chatName}`}
            >
                {chatName}
            </button>
        </li>
    );
};

export default ChatListItem;

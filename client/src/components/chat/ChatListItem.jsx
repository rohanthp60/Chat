import styles from "./Chat.module.css";

const ChatListItem = ({ chatId, name, isSelected, onSelect, unSeen = false }) => {
    const chatName = name?.trim() || "Unnamed chat";

    return (
        <li>
            <button
                type="button"
                className={`${styles.chatItem} ${isSelected ? styles.chatItemActive : ""}`}
                onClick={() => onSelect(chatId)}
                aria-label={`Open ${chatName}${unSeen ? ", unread messages" : ""}`}
            >
                <span className={styles.chatAvatar} aria-hidden="true">
                    {chatName.charAt(0).toUpperCase()}
                </span>
                <span className={`${styles.chatName} ${unSeen ? styles.chatNameUnseen : ""}`}>
                    {chatName}
                </span>
                {unSeen && <span className={styles.unseenIndicator} aria-hidden="true" />}
            </button>
        </li>
    );
}

export default ChatListItem;
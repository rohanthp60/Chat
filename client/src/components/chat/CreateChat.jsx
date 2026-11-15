import styles from "./Chat.module.css";

const CreateGroupChatButton = ({ setCreating }) => {
    return (
        <button className={styles.chatCreationButton} onClick={() => setCreating(true)}>
                + Group Chat
        </button>
    );
};

const NewDMButton = ({ setCreating }) => {
    return (
        <button className={styles.chatCreationButton} onClick={() => setCreating(true)}>
                + Contact
        </button>
    );
};

export { CreateGroupChatButton, NewDMButton };

import styles from "./Chat.module.css";

const CreateGroupChatButton = ({ setCreating }) => {
    return (
        <button className={styles.chatCreationButton} onClick={() => setCreating(true)}>
                Create New Chat
        </button>
    );
};

const NewDMButton = ({ setCreating }) => {
    return (
        <button className={styles.chatCreationButton} onClick={() => setCreating(true)}>
                Create New DM
        </button>
    );
};

export { CreateGroupChatButton, NewDMButton };

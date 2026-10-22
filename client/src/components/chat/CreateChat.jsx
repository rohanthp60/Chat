import { useState } from "react";
import ChatCreationForm from "./ChatCreationForm";
import styles from "./Chat.module.css";

const CreateChat = () => {
    const [creating, setCreating] = useState(false);

    if (creating) {
        return <ChatCreationForm setCreating={setCreating} />;
    }

    return (
        <div>
            <button className={styles.button} onClick={() => setCreating(true)}>
                Create New Chat
            </button>
        </div>
    );
};

export default CreateChat;

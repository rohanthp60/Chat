import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useApp } from "../../contexts/appContext";
import { getContacts } from "../../services/contactService";
import { createChat } from "../../services/chatService";
import ItemSelector from "./ItemSelector";
import styles from "./Chat.module.css";

const ContactItem = ({ item }) => <span>{item.userId}</span>;

const ChatCreationForm = ({ setCreating }) => {
    const { token } = useApp();
    const [contacts, setContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [createInProgress, setCreateInProgress] = useState(false);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const fetchedContacts = await getContacts(token);
                setContacts(fetchedContacts);
            } catch (error) {
                console.error("Error fetching contacts:", error);
                toast.error("Error fetching contacts: " + error.message);
            }
        };
        fetchContacts();
    }, [token]);

    const handleCreateChat = async () => {
        setCreateInProgress(true);
        try {
            const response = await createChat(token, selectedContacts);
            console.log("Create chat response:", response);
            if (!response?.success) {
                console.error("Failed to create chat:", response);
                toast.error("Failed to create chat: " + response?.message);
            } else {
                toast.success("Chat created successfully!");
                setCreating(false);
            }
        } catch (error) {
            toast.error("Error creating chat: " + error.message);
            console.error("Error creating chat:", error);
        } finally {
            setCreateInProgress(false);
        }
    };

    return (
        <div className={styles.panel}>
            <h2>Create Chat</h2>
            <ItemSelector
                items={contacts.map(contact => ({ ...contact, id: contact.userId }))}
                setSelectedItems={setSelectedContacts}
                ItemComponent={ContactItem}
                checkDisabled={createInProgress}
            />
            <div className={styles.actions}>
                <button
                    className={`${styles.button} ${styles.buttonSecondary}`}
                    onClick={() => setCreating(false)}
                >
                    Cancel
                </button>
                <button className={styles.button} onClick={handleCreateChat} disabled={createInProgress}>
                    Create Chat
                </button>
            </div>
        </div>
    );
};

export default ChatCreationForm;

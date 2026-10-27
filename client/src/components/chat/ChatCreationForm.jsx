import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useApp } from "../../contexts/appContext";
import { getContacts } from "../../services/contactService";
import { createChat } from "../../services/chatService";
import ItemSelector from "./ItemSelector";
import styles from "./Chat.module.css";

const ContactItem = ({ item }) => {
    const fullName = [item.firstName, item.middleName, item.lastName]
        .filter(Boolean)
        .join(" ");

    return (
        <span className={styles.contactDetails}>
            <strong className={styles.contactUserId}>{item.userId}</strong>
            {fullName && <span className={styles.contactName}>{fullName}</span>}
        </span>
    );
};

const GroupChatCreationForm = ({ setCreatingChat }) => {
    const { token } = useApp();
    const [contacts, setContacts] = useState([]);
    const [chatName, setChatName] = useState("");
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
            const response = await createChat(token, {participants: selectedContacts, name: chatName, groupChat: true});
            console.log("Create chat response:", response);
            if (!response?.success) {
                console.error("Failed to create chat:", response);
                toast.error("Failed to create chat: " + response?.message);
            } else {
                toast.success("Chat created successfully!");
                setCreatingChat(false);
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
            <div className={styles.formField}>
                <label htmlFor="chat-name">Chat name</label>
                <input
                    id="chat-name"
                    className={styles.formInput}
                    type="text"
                    name="name"
                    value={chatName}
                    onChange={(e) => setChatName(e.target.value)}
                    placeholder="Enter a name for your group"
                    maxLength={100}
                />
            </div>
            <h3>Contacts</h3>
            <ItemSelector
                items={contacts.map(contact => ({ ...contact, id: contact.userId }))}
                selectedItems={selectedContacts}
                setSelectedItems={setSelectedContacts}
                ItemComponent={ContactItem}
                checkDisabled={createInProgress}
            />
            <div className={styles.actions}>
                <button
                    className={`${styles.button} ${styles.buttonSecondary}`}
                    onClick={() => setCreatingChat(false)}
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

const NewDMForm = ({ setCreatingChat }) => {
    const { token } = useApp();
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
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

    const getContactFullName = (userId) => {
        const contact = contacts.find(c => c.userId === userId);
        if (!contact) return userId;
        const { firstName, middleName, lastName } = contact;
        return [firstName, middleName, lastName].filter(Boolean).join(" ");
    }

    const handleCreateChat = async () => {
        if (!selectedContact) {
            toast.error("Please select a contact to create a chat.");
            return;
        }
        setCreateInProgress(true);
        try {
            const response = await createChat(token, {name: getContactFullName(selectedContact), participants: [selectedContact], groupChat: false});
            console.log("Create chat response:", response);
            if (!response?.success) {
                console.error("Failed to create chat:", response);
                toast.error("Failed to create chat: " + response?.message);
            } else {
                toast.success("Chat created successfully!");
                setCreatingChat(false);
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
            <h2>Create Direct Message</h2>
            <h3>Contacts</h3>
            <ItemSelector
                items={contacts.map(contact => ({ ...contact, id: contact.userId }))}
                selectedItems={selectedContact ? [selectedContact] : []}
                setSelectedItems={update => setSelectedContact(previous => {
                    const previousItems = previous ? [previous] : [];
                    const nextItems = typeof update === "function"
                        ? update(previousItems)
                        : update;
                    return nextItems[0] || null;
                })}
                ItemComponent={ContactItem}
                checkDisabled={createInProgress}
                singleSelect={true}
            />
            <div className={styles.actions}>
                <button
                    className={`${styles.button} ${styles.buttonSecondary}`}
                    onClick={() => setCreatingChat(false)}
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

export { NewDMForm, GroupChatCreationForm };

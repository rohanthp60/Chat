import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useApp } from "../../contexts/appContext";
import { 
    getChatById, 
    getParticipants,
    removeParticipantsFromChat, 
    addParticipantsToChat } from "../../services/chatService";

import { getContacts } from "../../services/contactService";
import ItemSelector from "./ItemSelector";
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

const ParticipantsList = ({ chatId, readOnly, submitHandler, skipHandler, complement=false }) => {
    const { token, subscribe } = useApp();
    const [participants, setParticipants] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState([]);

    const doneHandler = readOnly ? submitHandler 
                        : async (e) => {
                            await submitHandler(token, chatId, selectedParticipants);
                        };
    
    const participantsSetter = async () => {
        const responseCurrent = await getParticipants(token, chatId);
        if (!complement) {
            if (responseCurrent?.success) {
                setParticipants(responseCurrent.participants || []);
            } else {
                console.error("Failed to fetch participants:", responseCurrent);
            }
        } else {
            const response = await getContacts(token);
            if (response?.success) {
                const currentParticipants = responseCurrent?.participants || [];
                const currentParticipantIds = new Set(currentParticipants.map(p => p.userId));
                const nonParticipants = response.contacts.filter(contact => !currentParticipantIds.has(contact.userId));
                setParticipants(nonParticipants);
            } else {
                console.error("Failed to fetch contacts:", response);
            }
        }
    }
    useEffect(() => {
        participantsSetter();
    }, [chatId, token]);

    useEffect(() => subscribe(message => {
        if (message.messageType === "chatParticipantsUpdated" && message.data?.chatId === chatId) {
            setParticipants(message.data?.participants || []);
        }
    }), [subscribe, chatId]);

    const ParticipantItem = ({ item }) => {
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
    
    return (
        <div className={styles.participantsPanel}>
            <h2>Participants</h2>
            <ItemSelector
                items={participants.map(participant => ({
                    id: participant.userId,
                    ...participant
                }))}
                selectedItems={selectedParticipants}
                setSelectedItems={setSelectedParticipants}
                ItemComponent={ParticipantItem}
                singleSelect={false}
                readOnly={readOnly}
            />
            <div className={styles.actions}>
                <button className={styles.button} onClick={doneHandler}>Done</button>
                {!readOnly && (
                    <button
                        className={`${styles.button} ${styles.buttonSecondary}`}
                        onClick={skipHandler}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </div>
    )
}

const Chat = ({ chatId }) => {
    const [text, setText] = useState("");
    const { token, subscribe, sendMessage, connectionState, userDetail } = useApp();
    const [messages, setMessages] = useState([]);
    const [menuOptions, setMenuOptions] = useState([]);
    const [menuOpen, setMenuOpen] = useState(false);
    const [viewingParticipants, setViewingParticipants] = useState(false);
    const [addingParticipants, setAddingParticipants] = useState(false);
    const [removingParticipants, setRemovingParticipants] = useState(false);

    const leaveChatHandler = async () => {
        try {
            await removeParticipantsFromChat(token, chatId, [userDetail?.userId]);
            toast.success("You have left the chat.");
        } catch (error) {
            console.error("Error leaving chat:", error);
            toast.error("Error leaving chat: " + error.message);
        }
    }


    useEffect(() => subscribe(message => {
        if (message.messageType === "error") {
            toast.error(message.data?.message || "WebSocket error");
            return;
        }

        console.log("Received WebSocket message:", message);
        if (message.data?.chatId !== chatId) {
            return;
        }

        if (message.messageType === "chatUpdate") {
            const incomingMessage = message.data?.lastMessage;
            if (incomingMessage) {
                setMessages(previous => mergeMessages(previous, [incomingMessage]));
            }
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
                        options = [
                            {
                                label: "Leave Chat",
                                onClick: leaveChatHandler
                            },
                            {
                                label: "View Participants",
                                onClick: () => {
                                    setMenuOpen(false);
                                    setViewingParticipants(true);
                                }
                            }
                        ];
                        if (isAdmin) {
                            options.push({
                                label: "Add Participants",
                                onClick: () => {
                                    setMenuOpen(false);
                                    setAddingParticipants(true);
                                }
                            });
                            options.push({
                                label: "Remove Participants",
                                onClick: () => {
                                    setMenuOpen(false);
                                    setRemovingParticipants(true);
                                }
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

    const addParticipantsHandler = async (selectedToken, selectedChatId, selectedParticipants) => {
        try {
            await addParticipantsToChat(selectedToken, selectedChatId, selectedParticipants);
            toast.success("Participants added successfully.");
        } catch (error) {
            console.error("Error adding participants:", error);
            toast.error("Error adding participants: " + error.message);
        } finally {
            setAddingParticipants(false);
        }
    };

    const removeParticipantsHandler = async (selectedToken, selectedChatId, selectedParticipants) => {
        try {
            await removeParticipantsFromChat(selectedToken, selectedChatId, selectedParticipants);
            toast.success("Participants removed successfully.");
        } catch (error) {
            console.error("Error removing participants:", error);
            toast.error("Error removing participants: " + error.message);
        } finally {
            setRemovingParticipants(false);
        }
    };

    const bodyRenderer = () => {
        if (viewingParticipants) {
            return (
                <ParticipantsList 
                    chatId={chatId} 
                    readOnly={true} 
                    submitHandler={() => setViewingParticipants(false)} 
                    skipHandler={() => setViewingParticipants(false)}
                />
            );
        }
        if (addingParticipants) {
            return (
                <ParticipantsList 
                    chatId={chatId} 
                    readOnly={false} 
                    complement={true}
                    skipHandler={() => setAddingParticipants(false)}
                    submitHandler={addParticipantsHandler}
                />
            );
        }
        if (removingParticipants) {
            return (
                <ParticipantsList 
                    chatId={chatId} 
                    readOnly={false} 
                    complement={false}
                    skipHandler={() => setRemovingParticipants(false)}
                    submitHandler={removeParticipantsHandler}
                />
            );
        }
        return null;
    };

    const menuOpenable = menuOptions.length > 0 && !viewingParticipants && !addingParticipants && !removingParticipants;

    return (
        <div className={styles.panel}>
            <div className={styles.menuWrapper}>
                {menuOpenable && <button
                    type="button"
                    className={styles.menuButton}
                    aria-expanded={menuOpen}
                    aria-label="Chat options"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    ...
                </button>}
                {menuOpen && <MenuOptions options={menuOptions} />}
            </div>
            {(viewingParticipants || addingParticipants || removingParticipants) ? (
                bodyRenderer()
            ) : (
                <>
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
                </>
            )}
        </div>
    );
};

export default Chat;

import { useState } from "react";

import LogOutButton from "./auth/LogOutButton";
import ChatList from "./chat/ChatList";
import {NewDMButton, CreateGroupChatButton} from "./chat/CreateChat";
import {NewDMForm, GroupChatCreationForm} from "./chat/ChatCreationForm";
import styles from "./Dashboard.module.css";
import { useApp } from "../contexts/appContext";

export const Dashboard = () => {
    const [creatingGroupChat, setCreatingGroupChat] = useState(false);
    const [creatingDM, setCreatingDM] = useState(false);
    const { userDetail } = useApp();

    let userName = userDetail?.userId;
    if (userDetail?.firstName || userDetail?.middleName || userDetail?.lastName) {
        userName = `${userDetail?.firstName || ""} ${userDetail?.middleName || ""} ${userDetail?.lastName || ""}`.trim();
    }

    const Page = () => {
        if (creatingGroupChat) {
            return <GroupChatCreationForm setCreatingChat={setCreatingGroupChat} />;
        } else if (creatingDM) {
            return <NewDMForm setCreatingChat={setCreatingDM} />;
        } else {
            return (
                <>
                    <div className={styles.chatCreationActions}>
                        <CreateGroupChatButton setCreating={setCreatingGroupChat} />
                        <NewDMButton setCreating={setCreatingDM} />
                    </div>
                    <h2>Your Chats</h2>
                    <ChatList />
                </>
            );
        }
    }
    return (
    <main className={styles.page}>
        <div className={styles.content}>
            <header className={styles.header}>
                <h1>Welcome {userName}</h1>
                <LogOutButton />
            </header>
            < Page />
        </div>
    </main>
    );
};

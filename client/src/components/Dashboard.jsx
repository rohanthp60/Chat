import LogOutButton from "./auth/LogOutButton";
import ChatList from "./chat/ChatList";
import CreateChat from "./chat/CreateChat";
import styles from "./Dashboard.module.css";

export const Dashboard = () => (
    <main className={styles.page}>
        <div className={styles.content}>
            <header className={styles.header}>
                <h1>Dashboard</h1>
                <LogOutButton />
            </header>
            <CreateChat />
            <h2>Your Chats</h2>
            <ChatList />
        </div>
    </main>
);

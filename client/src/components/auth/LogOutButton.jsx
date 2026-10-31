import { useApp } from "../../contexts/appContext";
import { useNavigate } from "react-router";
import styles from "../chat/Chat.module.css";

const LogOutButton = () => {
    const { setToken, breakConnection } = useApp();
    const navigate = useNavigate();

    const handleLogOut = () => {
        setToken(null);
        breakConnection();
        navigate("/auth/login", { replace: true });
    };

    return (
        <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={handleLogOut}>
            Log Out
        </button>
    );
};

export default LogOutButton;

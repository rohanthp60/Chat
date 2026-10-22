import { useApp } from "../../contexts/appContext";
import { useNavigate } from "react-router";
import styles from "../chat/Chat.module.css";

const LogOutButton = () => {
    const { setToken } = useApp();
    const navigate = useNavigate();

    const handleLogOut = () => {
        setToken(null);
        navigate("/auth/login", { replace: true });
    };

    return (
        <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={handleLogOut}>
            Log Out
        </button>
    );
};

export default LogOutButton;

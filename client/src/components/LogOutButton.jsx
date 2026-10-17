import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";

const LogOutButton = () => {
    const { setToken } = useAuth();
    const navigate = useNavigate();
    const handleLogOut = () => {
        setToken(null);
        navigate("/login", { replace: true });
    };

    return (
        <button onClick={handleLogOut}>Log Out</button>
    );
};

export default LogOutButton;
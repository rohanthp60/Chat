import { useState } from "react";
import { useLogIn } from "../services/authService";
import { toast } from "react-toastify";

export const Login = ({ setLoggedIn }) => {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const { 
        login, 
        goingOn, 
        completed, 
        success, 
        token, 
        message } = useLogIn();


    const onUserIdChange = e => {
        e.preventDefault();
        setUserId(e.target.value);
    }

    const onPasswordChange = e => {
        e.preventDefault();
        setPassword(e.target.value);
    }

    const performLogin = async e => {
        e.preventDefault();
        const result = await login(userId, password);
        if (result?.success) {
            toast.success("Logged In");
            setLoggedIn(true);
        } else {
            toast.error(`${message || "Some error occured."} Please try again.`);
        }
    }

    return (
        <form onSubmit={performLogin}>
            <h1>Login</h1>
            <input 
                name="userId" 
                type="text"
                value={userId}
                onChange={onUserIdChange}
            />
            <input
                name="password"
                type="password"
                value={password}
                onChange={onPasswordChange}
            />
            <button type="submit" disabled={goingOn}>Login</button>
        </form>
    );
}
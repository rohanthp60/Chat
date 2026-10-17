import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { Link } from "react-router";
import { useNavigate } from "react-router";
import styles from "./AuthForm.module.css";
import { useAuthenticate } from "../services/authService";


export const Login = () => {
    const { setToken } = useAuth();
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { 
        authenitcate: login,
        goingOn,
        completed,
        success,
        token,
        message } = useAuthenticate();


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
            setToken(result?.token);
            navigate("/dashboard", { replace: true });
        } else {
            toast.error(`${message || "Some error occured."} Please try again.`);
        }
    }

    return (
    <>
        <form onSubmit={performLogin}>
            <div className={styles.fields}>
                <h1>Login</h1>
                <label htmlFor="userId">User ID</label>
                <input
                    name="userId"
                    type="text"
                    value={userId}
                    onChange={onUserIdChange}
                />
                <label htmlFor="password">Password</label>
                <input
                    name="password"
                    type="password"
                    value={password}
                    onChange={onPasswordChange}
                />
                <button type="submit" disabled={goingOn}>Login</button>
            </div>
        </form>
        <Link className={styles.link} to="../register" replace>New Here? Register</Link>
    </>
    );
}
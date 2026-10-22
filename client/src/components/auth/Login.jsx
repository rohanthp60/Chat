import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useApp } from "../../contexts/appContext";
import { useAuthenticate } from "../../services/authService";
import styles from "./AuthForm.module.css";

const Login = () => {
    const { setToken } = useApp();
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { authenitcate: login, goingOn, message } = useAuthenticate();

    const performLogin = async event => {
        event.preventDefault();
        const result = await login(userId, password);
        if (result?.success) {
            toast.success("Logged In");
            setToken(result.token);
            navigate("/dashboard", { replace: true });
        } else {
            toast.error(`${message || "Some error occured."} Please try again.`);
        }
    };

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
                        onChange={event => setUserId(event.target.value)}
                    />
                    <label htmlFor="password">Password</label>
                    <input
                        name="password"
                        type="password"
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                    />
                    <button type="submit" disabled={goingOn}>Login</button>
                </div>
            </form>
            <Link className={styles.link} to="../register" replace>
                New Here? Register
            </Link>
        </>
    );
};

export default Login;

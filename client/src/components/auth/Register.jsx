import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useAuthenticate } from "../../services/authService";
import styles from "./AuthForm.module.css";

const Register = () => {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const navigate = useNavigate();
    const { goingOn, authenitcate } = useAuthenticate(true);

    const performRegister = async event => {
        event.preventDefault();
        if (Math.min(password.length, confirmPassword.length) < 8) {
            toast.error("Password should be at least 8 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Password and confirm password should match.");
            return;
        }
        try {
            const result = await authenitcate(userId, password);
            if (result?.success) {
                toast.success("Registered successfully. Please log in.");
                navigate("/auth/login", { replace: true });
            } else {
                toast.error(`${result?.message || "Some error occured."} Please try again.`);
            }
        } catch (error) {
            console.error("Registration failed:", error);
            toast.error("An error occurred while registering. Please try again.");
        }
    };

    return (
        <>
            <form onSubmit={performRegister}>
                <div className={styles.fields}>
                    <h1>Register</h1>
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
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={event => setConfirmPassword(event.target.value)}
                    />
                    <button type="submit" disabled={goingOn}>Register</button>
                </div>
            </form>
            <Link className={styles.link} to="../login">
                Already have an account? Log in
            </Link>
        </>
    );
};

export default Register;

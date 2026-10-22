import { Navigate, Route, Routes } from "react-router";
import Login from "./Login";
import Register from "./Register";
import styles from "./AuthForm.module.css";

export const AuthPage = () => (
    <main className={styles.page}>
        <section className={styles.card}>
            <Routes>
                <Route index element={<Navigate to="login" />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
            </Routes>
        </section>
    </main>
);

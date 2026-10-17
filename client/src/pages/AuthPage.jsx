import { Login } from './Login';
import { Register } from './Register';
import styles from './AuthForm.module.css';

import { Route, Routes, Navigate } from 'react-router';

export const AuthPage = () => {
    return (
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
}
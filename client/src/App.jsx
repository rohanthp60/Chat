import { ToastContainer, toast } from 'react-toastify'
import { Routes, Route, Navigate, Outlet, BrowserRouter, useNavigate } from 'react-router';
import "react-toastify/dist/ReactToastify.css";

import { AuthPage } from './components/auth/AuthPage';
import { Dashboard } from './components/Dashboard';
import { useApp } from './contexts/appContext';
import { validToken } from './services/authService';
import { useEffect, useState } from 'react';

function RequireAuth () {
    const { token } = useApp();
    const navigate = useNavigate();
    const [isValid, setIsValid] = useState(null);
    const [validatedToken, setValidatedToken] = useState(null);

    useEffect(() => {
        if (!token) {
            return;
        }

        let cancelled = false;
        const checkToken = async () => {
            const valid = await validToken(token);
            if (!cancelled) {
                setIsValid(valid);
                setValidatedToken(token);
            }
        };
        checkToken();
        return () => {
            cancelled = true;
        };
    }, [token]);

    useEffect(() => {
        if (validatedToken === token && isValid === false) {
            toast.error("Session expired. Please log in again.", {
                toastId: "session-expired"
            });
            navigate("/auth", { replace: true });
        }
    }, [isValid, navigate, token, validatedToken]);

    if (!token) {
        return <Navigate to="/auth" replace/>;
    }

    if (validatedToken !== token || isValid === null) {
        return <div>Loading...</div>;
    }

    if (!isValid) {
        return <div>Redirecting...</div>;
    }
    return <Outlet />;
}

function App() {
    return (
    <>
        <BrowserRouter>
        <Routes>
            <Route path="/auth/*" element={<AuthPage />} />
            <Route element={<RequireAuth />}>
                <Route path="/dashboard/*" element={<Dashboard />} />
            </Route>
            <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
        </BrowserRouter>
        <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
    </>
    )
}

export default App

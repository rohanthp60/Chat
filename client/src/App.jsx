import { useState } from 'react';
import { ToastContainer } from 'react-toastify'
import { Routes, Route, Navigate, Outlet, BrowserRouter } from 'react-router';
import "react-toastify/dist/ReactToastify.css";

import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';


function RequireAuth ({ loggedIn }) {
    if (!loggedIn) {
        return <Navigate to="/auth" replace/>;
    }
    return <Outlet />;
}

function App() {
    const [token, setToken] = useState("");
    return (
    <>
        <BrowserRouter>
        <Routes>
            <Route path="/auth/*" element={<AuthPage setToken={setToken} />} />
            <Route element={<RequireAuth loggedIn={!!token} />}>
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

import { useState } from 'react';
import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css";

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

function App() {
    const [loggedIn, setLoggedIn] = useState(false);
    return (
        <>
            {!loggedIn ?
            <Login setLoggedIn={setLoggedIn} /> :
            <Dashboard />}
            <ToastContainer />
        </>
    )
}

export default App

import './index.css';
import { useState } from 'react';
import Login from "./views/Login/Login.jsx";
import Register from "./views/Register/Register.jsx";
import Dashboard from "./views/Dashboard/Dashboard.jsx";
import TestComponent from "./TestComponent.jsx";
import { supabase } from './supabaseClient';

const ENABLE_TEST_MODE = true;

export default function App() {
    const [currentPage, setCurrentPage] = useState('login');
    const [user, setUser] = useState(null);

    if (ENABLE_TEST_MODE) {
        return <TestComponent />;
    }

    const handleLoginSuccess = (email) => {
        setUser(email);
        setCurrentPage('dashboard');
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        await supabase.auth.signOut();
        setUser(null);
        setCurrentPage('login');
    };

    const goToLogin = (e) => {
        e.preventDefault();
        setCurrentPage('login');
    };

    const goToRegister = (e) => {
        e.preventDefault();
        setCurrentPage('register');
    };

    return (
        <>
            {user ? (
                <Dashboard email={user} onLogout={handleLogout} />
            ) : currentPage === 'login' ? (
                <Login onNavigateToRegister={goToRegister} onLoginSuccess={handleLoginSuccess} />
            ) : (
                <Register onNavigateToLogin={goToLogin} />
            )}
        </>
    );
}
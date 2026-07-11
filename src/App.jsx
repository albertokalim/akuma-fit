import './index.css';
import { useState } from 'react';
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Dashboard from "./Dashboard.jsx";
import { supabase } from './supabaseClient';

export default function App() {
    const [currentPage, setCurrentPage] = useState('login');
    const [user, setUser] = useState(null);

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
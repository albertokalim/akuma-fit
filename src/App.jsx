import './index.css';
import { useState } from 'react';
import Login from "./views/Login/Login.jsx";
import Register from "./views/Register/Register.jsx";
import Home from "./views/Home/Home.jsx";
import InitialAssessment from "./views/InitialAssessment/InitialAssessment.jsx";
import TestComponent from "./TestComponent.jsx";
import { supabase } from './supabaseClient';

const ENABLE_TEST_MODE = false;

export default function App() {
    const [currentPage, setCurrentPage] = useState('login');
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState('client');
    const [checkingAssessment, setCheckingAssessment] = useState(false);

    if (ENABLE_TEST_MODE) {
        return <TestComponent />;
    }

    // Comprueba si el usuario ya tiene un profile y una valoración inicial guardada
    const getProfileAndAssessmentStatus = async () => {
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData?.user) {
            return { completed: false, role: 'client' };
        }

        const { data: profile, error: profileError } = await supabase
            .from('profile')
            .select('id, role')
            .eq('user', authData.user.id)
            .maybeSingle();

        if (profileError || !profile) {
            return { completed: false, role: 'client' };
        }

        const { data: assessment, error: assessmentError } = await supabase
            .from('initial_assessment')
            .select('id')
            .eq('client', profile.id)
            .maybeSingle();

        return {
            completed: !assessmentError && !!assessment,
            role: profile.role || 'client',
        };
    };

    const handleLoginSuccess = async (email) => {
        setUser(email);
        setCheckingAssessment(true);

        const { completed, role } = await getProfileAndAssessmentStatus();

        setUserRole(role);
        setCheckingAssessment(false);
        setCurrentPage(completed ? 'home' : 'assessment');
    };

    const handleAssessmentComplete = () => {
        setCurrentPage('home');
    };

    const handleLogout = async (e) => {
        e?.preventDefault();
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

    if (checkingAssessment) {
        return <p>Cargando...</p>;
    }

    return (
        <>
            {user && currentPage === 'assessment' ? (
                <InitialAssessment onComplete={handleAssessmentComplete} />
            ) : user && currentPage === 'home' ? (
                <Home email={user} onLogout={handleLogout} userRole={userRole} />
            ) : currentPage === 'login' ? (
                <Login onNavigateToRegister={goToRegister} onLoginSuccess={handleLoginSuccess} />
            ) : (
                <Register onNavigateToLogin={goToLogin} />
            )}
        </>
    );
}
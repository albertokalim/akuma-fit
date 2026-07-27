import './index.css';
import { useState } from 'react';
import Login from "./views/Login/Login.jsx";
import Register from "./views/Register/Register.jsx";
import Home from "./views/Home/Home.jsx";
import InitialAssessment from "./views/InitialAssessment/InitialAssessment.jsx";
import TestComponent from "./TestComponent.jsx";
import Spinner from "./components/primitives/Spinner/Spinner.jsx";
import { authService } from './services/authService.js';
import { profileService } from './services/profileService.js';
import { assessmentService } from './services/assessmentService.js';

const ENABLE_TEST_MODE = false;

export default function App() {
    const [currentPage, setCurrentPage] = useState('login');
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState('client');
    const [checkingAssessment, setCheckingAssessment] = useState(false);

    if (ENABLE_TEST_MODE) {
        return <TestComponent />;
    }

    const getProfileAndAssessmentStatus = async () => {
        try {
            const profile = await profileService.getWithRole();

            if (!profile) {
                return { completed: false, role: 'client' };
            }

            const completed = await assessmentService.exists(profile.id);

            return {
                completed,
                role: profile.role || 'client',
            };
        } catch {
            return { completed: false, role: 'client' };
        }
    };

    const handleLoginSuccess = async (email) => {
        const authUser = await authService.getUser();
        setUser(email);
        setUserId(authUser.id);
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
        await authService.signOut();
        setUser(null);
        setUserId(null);
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
        return <Spinner text="Cargando..." />;
    }

    return (
        <>
            {user && currentPage === 'assessment' ? (
                <InitialAssessment onComplete={handleAssessmentComplete} />
            ) : user && currentPage === 'home' ? (
                <Home email={user} userId={userId} onLogout={handleLogout} userRole={userRole} />
            ) : currentPage === 'login' ? (
                <Login onNavigateToRegister={goToRegister} onLoginSuccess={handleLoginSuccess} />
            ) : (
                <Register onNavigateToLogin={goToLogin} />
            )}
        </>
    );
}

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
    const [profileId, setProfileId] = useState(null);
    const [userRole, setUserRole] = useState('client');
    const [checkingAssessment, setCheckingAssessment] = useState(false);

    if (ENABLE_TEST_MODE) {
        return <TestComponent />;
    }

    const getProfileAndAssessmentStatus = async () => {
        try {
            const profile = await profileService.getWithRole();
            console.log('📋 Profile retrieved:', profile);

            if (!profile) {
                console.log('⚠️ No profile found');
                return { completed: false, role: 'client', profileId: null };
            }

            try {
                const completed = await assessmentService.exists(profile.id);
                console.log('✅ Assessment exists:', completed, 'for profileId:', profile.id);
                return {
                    completed,
                    role: profile.role || 'client',
                    profileId: profile.id,
                };
            } catch (err) {
                console.error('❌ Error checking assessment:', err);
                return {
                    completed: false,
                    role: profile.role || 'client',
                    profileId: profile.id,
                };
            }
        } catch (err) {
            console.error('❌ Error getting profile:', err);
            return { completed: false, role: 'client', profileId: null };
        }
    };

    const handleLoginSuccess = async (email) => {
        setUser(email);
        setCheckingAssessment(true);

        const { completed, role, profileId: id } = await getProfileAndAssessmentStatus();

        const nextPage = (completed || role === 'coach') ? 'home' : 'assessment';
        console.log('🔀 Navigation decision:', { completed, role, profileId: id, nextPage });

        setProfileId(id);
        setUserRole(role);
        setCheckingAssessment(false);
        setCurrentPage(nextPage);
    };

    const handleAssessmentComplete = () => {
        setCurrentPage('home');
    };

    const handleLogout = async (e) => {
        e?.preventDefault();
        await authService.signOut();
        setUser(null);
        setProfileId(null);
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
                <Home email={user} profileId={profileId} onLogout={handleLogout} userRole={userRole} />
            ) : currentPage === 'login' ? (
                <Login onNavigateToRegister={goToRegister} onLoginSuccess={handleLoginSuccess} />
            ) : (
                <Register onNavigateToLogin={goToLogin} />
            )}
        </>
    );
}

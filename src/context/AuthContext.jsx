import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient.js';
import { authService } from '../services/authService.js';
import { profileService } from '../services/profileService.js';
import { assessmentService } from '../services/assessmentService.js';
import { AuthContext } from './authContextInstance.js';

/**
 * Proveedor del estado de sesión y perfil. Centraliza `email`, `profileId`,
 * `userRole` y `assessmentCompleted`, y expone las acciones de autenticación
 * (`login`, `logout`, `completeAssessment`), evitando el prop-drilling a
 * través de App -> Home -> pantallas.
 *
 * @param {Object} props - Props del provider.
 * @param {React.ReactNode} props.children - Hijos a envolver.
 */
export function AuthProvider({ children }) {
    const [status, setStatus] = useState('loading'); 
    const [user, setUser] = useState(null);
    const [profileId, setProfileId] = useState(null);
    const [userRole, setUserRole] = useState('client');
    const [assessmentCompleted, setAssessmentCompleted] = useState(false);

    const loadProfile = useCallback(async () => {
        const profile = await profileService.getWithRole();

        if (!profile) {
            setProfileId(null);
            setUserRole('client');
            setAssessmentCompleted(false);
            return;
        }

        const completed = profile.role === 'coach'
            ? true
            : await assessmentService.exists(profile.id).catch(() => false);

        setProfileId(profile.id);
        setUserRole(profile.role || 'client');
        setAssessmentCompleted(completed);
    }, []);

    useEffect(() => {
        let active = true;

        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!active) return;

            if (session?.user) {
                setUser(session.user.email);
                await loadProfile();
                setStatus('signed-in');
            } else {
                setStatus('signed-out');
            }
        };

        init();

        const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfileId(null);
                setUserRole('client');
                setAssessmentCompleted(false);
                setStatus('signed-out');
            }
        });

        return () => {
            active = false;
            subscription?.subscription?.unsubscribe();
        };
    }, [loadProfile]);

    const login = useCallback(async (email, password) => {
        await authService.signIn(email, password);
        setUser(email);
        await loadProfile();
        setStatus('signed-in');
    }, [loadProfile]);

    const logout = useCallback(async () => {
        await authService.signOut();
        setUser(null);
        setProfileId(null);
        setUserRole('client');
        setAssessmentCompleted(false);
        setStatus('signed-out');
    }, []);

    const completeAssessment = useCallback(() => {
        setAssessmentCompleted(true);
    }, []);

    const value = {
        status,
        user,
        profileId,
        userRole,
        assessmentCompleted,
        login,
        logout,
        completeAssessment,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

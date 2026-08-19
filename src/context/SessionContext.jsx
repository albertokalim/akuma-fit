import { useCallback, useEffect, useState } from 'react';
import { SessionContext } from './sessionContextInstance.js';
import { sessionService } from '../services/sessionService.js';
import { useAuth } from './useAuth.js';

 
export function SessionProvider({ children }) {
    const { profileId, userRole } = useAuth();
    const [activeSession, setActiveSession] = useState(null);
    const [initError, setInitError] = useState(null);
    const [checking, setChecking] = useState(false);
    const [retryToken, setRetryToken] = useState(0);

    const isClient = userRole === 'client' && !!profileId;

    useEffect(() => {
        if (!isClient) {
            return undefined;
        }

        let active = true;

        const init = async () => {
            setChecking(true);
            setInitError(null);

            try {
                const session = await sessionService.getActive(profileId);
                if (!active) return;
                setActiveSession(session);
            } catch (err) {
                if (!active) return;
                setInitError(err.message);
            } finally {
                if (active) setChecking(false);
            }
        };

        init();

        return () => {
            active = false;
        };
    }, [isClient, profileId, retryToken]);

    const retryCheck = useCallback(() => {
        setRetryToken((prev) => prev + 1);
    }, []);

    const startSession = useCallback(async (routine) => {
        const session = await sessionService.create(profileId, routine);
        setActiveSession({ ...session, routine: { id: routine.id, title: routine.title } });
        return session;
    }, [profileId]);

    const clearSession = useCallback(() => {
        setActiveSession(null);
    }, []);

    const value = {
        activeSession,
        startSession,
        clearSession,
        checkingActiveSession: checking,
        activeSessionCheckError: initError,
        retryActiveSessionCheck: retryCheck,
    };

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

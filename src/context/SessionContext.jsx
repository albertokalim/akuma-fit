import { useCallback, useEffect, useState } from 'react';
import { SessionContext } from './sessionContextInstance.js';
import { sessionService } from '../services/sessionService.js';
import { useAuth } from './useAuth.js';

/**
 * Estado global de la sesión de entrenamiento activa. Al montar (o al
 * reabrir la app tras un cierre) consulta a Supabase si el cliente tiene
 * una sesión con status 'active'; si existe, cualquier vista puede mostrar
 * el banner de "sesión en curso" y la pestaña Entrenar la reanuda en el
 * punto donde se quedó. Sólo los clientes tienen sesiones de entrenamiento.
 *
 * Vive dentro de la ruta /app, así que al cerrar sesión el provider se
 * desmonta y el estado se descarta junto con él.
 */
export function SessionProvider({ children }) {
    const { profileId, userRole } = useAuth();
    const [activeSession, setActiveSession] = useState(null);
    // Distinto de "no hay sesión activa": si la consulta inicial falla (red,
    // Supabase caído...) no sabemos si hay o no una sesión activa. Antes este
    // caso se trataba igual que "no hay sesión" (se ocultaba el error y se
    // dejaba `activeSession` en null), lo que podía llevar a que el cliente
    // "perdiera" su sesión en curso desde el punto de vista de la UI y
    // arrancara una segunda sesión activa en paralelo desde RoutinePicker.
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
                // No se toca `activeSession`: si ya había una cargada de un
                // intento anterior, se mantiene en vez de descartarla.
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

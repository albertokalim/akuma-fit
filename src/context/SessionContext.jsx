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

    const isClient = userRole === 'client' && !!profileId;

    useEffect(() => {
        if (!isClient) {
            return undefined;
        }

        let active = true;

        const init = async () => {
            try {
                const session = await sessionService.getActive(profileId);
                if (active) setActiveSession(session);
            } catch {
                if (active) setActiveSession(null);
            }
        };

        init();

        return () => {
            active = false;
        };
    }, [isClient, profileId]);

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
    };

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

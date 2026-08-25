import { useContext } from 'react';
import { SessionContext } from './sessionContextInstance.js';

/**
 * Devuelve el valor del contexto de la sesión de entrenamiento.
 *
 * @returns {Object} Estado y acciones de la sesión activa.
 * @throws {Error} Si se usa fuera de un <SessionProvider>.
 */
export function useSession() {
    const ctx = useContext(SessionContext);
    if (!ctx) {
        throw new Error('useSession debe usarse dentro de un <SessionProvider>');
    }
    return ctx;
}

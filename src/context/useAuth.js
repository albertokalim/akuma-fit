import { useContext } from 'react';
import { AuthContext } from './authContextInstance.js';

/**
 * Devuelve el valor del contexto de autenticación.
 *
 * @returns {Object} Estado y acciones de autenticación.
 * @throws {Error} Si se usa fuera de un <AuthProvider>.
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
    }
    return ctx;
}

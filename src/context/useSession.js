import { useContext } from 'react';
import { SessionContext } from './sessionContextInstance.js';

export function useSession() {
    const ctx = useContext(SessionContext);
    if (!ctx) {
        throw new Error('useSession debe usarse dentro de un <SessionProvider>');
    }
    return ctx;
}

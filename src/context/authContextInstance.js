import { createContext } from 'react';

/**
 * Contexto de React para el estado de autenticación. Se define en un archivo
 * separado para evitar ciclos de importación entre el provider y el hook.
 */
export const AuthContext = createContext(null);

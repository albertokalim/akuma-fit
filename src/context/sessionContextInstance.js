import { createContext } from 'react';

/**
 * Contexto de React para el estado de la sesión de entrenamiento. Se define
 * en un archivo separado para evitar ciclos de importación entre el provider
 * y el hook.
 */
export const SessionContext = createContext(null);

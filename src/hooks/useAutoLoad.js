import { useEffect } from 'react';

/**
 * Hook para cargar datos automáticamente al montar el componente
 * y proporciona una función de reload
 * 
 * @param {Function} loadFn - Función de carga (normalmente de useResource)
 * @returns {Object} - { reload }
 */
export const useAutoLoad = (loadFn) => {
    useEffect(() => {
        loadFn();
    }, [loadFn]);

    return { reload: loadFn };
};

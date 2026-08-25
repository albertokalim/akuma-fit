import { useEffect } from 'react';

/**
 * Ejecuta `loadFn` una vez al montar el componente y devuelve `reload` para
 * poder volver a ejecutarla manualmente.
 *
 * @param {Function} loadFn - Función de carga a ejecutar.
 * @returns {{reload: Function}} Función `reload` que vuelve a ejecutar `loadFn`.
 */
export const useAutoLoad = (loadFn) => {
    useEffect(() => {
        loadFn();
    }, [loadFn]);

    return { reload: loadFn };
};

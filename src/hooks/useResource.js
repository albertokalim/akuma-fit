import { useState, useCallback } from 'react';

/**
 * Hook genérico para cargar y gestionar recursos desde un servicio con
 * método `getAll()`. Sustituye a hooks específicos como `useCheckIns` o
 * `useMeasurements`.
 *
 * @param {Object} service - Servicio que implementa `getAll()`.
 * @returns {{items: Array, setItems: Function, loading: boolean, error: string|null, load: Function, reload: Function}} Estado y acciones del recurso.
 */
export const useResource = (service) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await service.getAll();
            setItems(data);
            return data;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [service]);

    return {
        items,
        setItems,
        loading,
        error,
        load,
        reload: load
    };
};

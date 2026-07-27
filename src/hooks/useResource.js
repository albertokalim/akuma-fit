import { useState, useCallback } from 'react';

/**
 * Hook genérico para cargar y gestionar recursos desde un servicio
 * Reemplaza los hooks específicos useCheckIns y useMeasurements
 * 
 * @param {Object} service - Servicio que implementa getAll()
 * @returns {Object} - { items, setItems, loading, error, load, reload }
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

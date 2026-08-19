import { useState, useCallback } from 'react';

 
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

import { useEffect, useState } from 'react';

 
export function useAsyncData(loadFn, deps, initialValue = []) {
    const [data, setData] = useState(initialValue);
    const [loading, setLoading] = useState(!!loadFn);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;

        const run = async () => {
            if (!loadFn) {
                setLoading(false);
                setData(initialValue);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const result = await loadFn();
                if (active) setData(result);
            } catch (err) {
                if (active) setError(err.message);
            } finally {
                if (active) setLoading(false);
            }
        };

        run();

        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, loading, error };
}

import { useEffect, useState } from 'react';

/**
 * Realiza una carga asíncrona y expone su estado (`data`, `loading`, `error`).
 * Vuelve a ejecutar `loadFn` cada vez que cambia algún elemento de `deps` y
 * evita actualizar el estado si el componente se desmonta durante la carga.
 *
 * @param {Function} loadFn - Función asíncrona que devuelve los datos.
 * @param {Array} deps - Dependencias que disparan una nueva carga.
 * @param {*} [initialValue=[]] - Valor inicial de `data`.
 * @returns {{data: *, loading: boolean, error: string|null}} Estado de la carga.
 */
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

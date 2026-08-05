import { useEffect, useState } from 'react';

/**
 * Hook genérico para cargar datos asíncronos que dependen de parámetros
 * variables (p.ej. el cliente seleccionado por un coach). Complementa a
 * useResource (pensado para service.getAll() sin argumentos) evitando que
 * cada pantalla reimplemente su propio loading/error/try-catch a mano.
 *
 * @param {Function|null} loadFn - función async que devuelve los datos, o
 *   null/undefined para no ejecutar la carga (p.ej. mientras no haya un
 *   cliente seleccionado).
 * @param {Array} deps - dependencias que disparan una nueva carga.
 * @param {*} initialValue - valor con el que se resetea `data` cuando no
 *   hay `loadFn` (p.ej. mientras no haya cliente seleccionado).
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
        // eslint-disable-next-line react-hooks/exhaustive-deps -- `deps` es la lista de dependencias, provista por quien llama al hook
    }, deps);

    return { data, loading, error };
}

import { useEffect, useState } from 'react';

/**
 * Devuelve una versión "debounced" de un valor, útil para evitar disparar
 * una consulta a la base de datos en cada pulsación de tecla (p.ej. en
 * campos de búsqueda).
 *
 * @param {*} value - valor a debounced.
 * @param {number} delay - retardo en milisegundos (por defecto 350ms).
 */
export function useDebouncedValue(value, delay = 350) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timeoutId = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timeoutId);
    }, [value, delay]);

    return debouncedValue;
}

import { useEffect, useState } from 'react';

/**
 * Devuelve una versión "debounced" de `value` que solo se actualiza tras
 * `delay` ms sin cambios. Útil para evitar lanzar una consulta en cada
 * pulsación (p. ej. en campos de búsqueda).
 *
 * @param {*} value - Valor a "debounced".
 * @param {number} [delay=350] - Retardo en milisegundos.
 * @returns {*} Último valor una vez transcurrido el retardo.
 */
export function useDebouncedValue(value, delay = 350) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timeoutId = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timeoutId);
    }, [value, delay]);

    return debouncedValue;
}

import { useEffect, useState } from 'react';

/**
 * Cuenta el tiempo transcurrido (en milisegundos) desde `startedAt`,
 * actualizándose cada segundo. Devuelve 0 si `startedAt` es nulo.
 *
 * @param {string|Date|null} startedAt - Momento de inicio.
 * @returns {number} Milisegundos transcurridos.
 */
export function useElapsedTime(startedAt) {
    const [elapsedMs, setElapsedMs] = useState(0);

    useEffect(() => {
        if (!startedAt) {
            return undefined;
        }

        const start = new Date(startedAt).getTime();

        const tick = () => setElapsedMs(Math.max(0, Date.now() - start));

        tick();
        const intervalId = setInterval(tick, 1000);

        return () => clearInterval(intervalId);
    }, [startedAt]);

    return elapsedMs;
}

/**
 * Formatea una duración en milisegundos como `mm:ss`, o `hh:mm:ss` si
 * supera la hora.
 *
 * @param {number} ms - Duración en milisegundos.
 * @returns {string} Duración formateada.
 */
export function formatElapsed(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (value) => String(value).padStart(2, '0');

    return hours > 0
        ? `${hours}:${pad(minutes)}:${pad(seconds)}`
        : `${pad(minutes)}:${pad(seconds)}`;
}

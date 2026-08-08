import { useEffect, useState } from 'react';

/**
 * Devuelve los milisegundos transcurridos desde `startedAt` (fecha ISO),
 * actualizándose cada segundo. Se usa para el cronómetro de la sesión de
 * entrenamiento, tanto en la propia vista como en el banner del header.
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

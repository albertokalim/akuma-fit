import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 768px)';

/**
 * Devuelve `true` si el viewport es móvil (<= 768px) y se actualiza al
 * cambiar el tamaño de la ventana.
 *
 * @returns {boolean} `true` si el viewport es móvil.
 */
export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);

    useEffect(() => {
        const mediaQuery = window.matchMedia(MOBILE_QUERY);

        const handleChange = (event) => setIsMobile(event.matches);

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return isMobile;
}

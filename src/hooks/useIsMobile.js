import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 768px)';

/**
 * Detecta si el viewport está en tamaño móvil (mismo breakpoint que los
 * media queries de los estilos). La vista de entrenamiento lo usa para
 * cambiar entre un ejercicio por pantalla (móvil, con swipe) y la lista
 * completa de ejercicios (escritorio).
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

import { useCallback, useRef, useState } from 'react';

const IGNORED_TARGETS_SELECTOR = 'input, button, textarea, select, video';

/**
 * Gestión del gesto de swipe horizontal usado en el layout móvil de
 * TrainingView (deslizar a la derecha completa el ejercicio actual,
 * deslizar a la izquierda vuelve al anterior), separada de la lógica de
 * negocio de la sesión para poder testear cada una por separado.
 *
 * `runWithLeaveAnimation` se expone aparte porque la animación de salida se
 * dispara tanto al soltar el swipe como al pulsar el botón "Completar
 * ejercicio" (en móvil ambos caminos deben animar igual).
 */
export function useSwipeGesture({
    threshold = 80,
    leaveAnimationMs = 220,
    canGoBack,
    onSwipeBack,
    canComplete,
    onSwipeComplete,
    onBlockedComplete,
} = {}) {
    const [dragging, setDragging] = useState(false);
    const [dragDelta, setDragDelta] = useState(0);
    const [leaving, setLeaving] = useState(false);
    const touchStartRef = useRef(null);

    const runWithLeaveAnimation = useCallback((fn) => {
        setLeaving(true);
        setTimeout(() => {
            setLeaving(false);
            setDragDelta(0);
            fn();
        }, leaveAnimationMs);
    }, [leaveAnimationMs]);

    const handleTouchStart = useCallback((event) => {
        if (event.target.closest(IGNORED_TARGETS_SELECTOR)) return;
        touchStartRef.current = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
        };
    }, []);

    const handleTouchMove = useCallback((event) => {
        if (!touchStartRef.current) return;

        const deltaX = event.touches[0].clientX - touchStartRef.current.x;
        const deltaY = event.touches[0].clientY - touchStartRef.current.y;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            setDragging(true);
            setDragDelta(deltaX);
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (!touchStartRef.current) return;

        const deltaX = dragDelta;
        touchStartRef.current = null;
        setDragging(false);

        if (deltaX > threshold) {
            if (canComplete) {
                // No se resetea dragDelta aquí: la tarjeta se queda visualmente
                // desplazada hasta que `onSwipeComplete` decida animar la salida
                // (recibe `runWithLeaveAnimation` como argumento), igual que
                // hacía el código original al completar un ejercicio arrastrando.
                onSwipeComplete(runWithLeaveAnimation);
            } else {
                setDragDelta(0);
                if (onBlockedComplete) onBlockedComplete();
            }
        } else if (deltaX < -threshold && canGoBack) {
            setDragDelta(0);
            onSwipeBack();
        } else {
            setDragDelta(0);
        }
    }, [dragDelta, threshold, canComplete, canGoBack, onSwipeComplete, onSwipeBack, onBlockedComplete, runWithLeaveAnimation]);

    return {
        dragging,
        dragDelta,
        leaving,
        runWithLeaveAnimation,
        touchHandlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd,
        },
    };
}

import ExerciseCard from './ExerciseCard.jsx';
import SessionActionFeedback from './SessionActionFeedback.jsx';
import { useSwipeGesture } from './useSwipeGesture.js';

const SWIPE_THRESHOLD = 80;
const LEAVE_ANIMATION_MS = 220;

/**
 * Vista de entrenamiento móvil: un ejercicio a la vez con navegación por
 * swipe y puntos de progreso.
 *
 * @param {Object} props - Props del componente.
 * @param {Object} props.training - Estado devuelto por `useTrainingSession`.
 * @param {number} props.currentIndex - Índice del ejercicio actual.
 * @param {(index: number) => void} props.setCurrentIndex - Setter del índice.
 */
function MobileTrainingView({ training, currentIndex, setCurrentIndex }) {
    const { matchedExercises, currentPair, setValues, completedMap, rpeMap, busy, actionError, hint } = training;

    const canComplete = currentPair
        ? training.isExerciseComplete(currentPair.row, currentPair.exercise)
        : false;

    const { dragging, dragDelta, leaving, runWithLeaveAnimation, touchHandlers } = useSwipeGesture({
        threshold: SWIPE_THRESHOLD,
        leaveAnimationMs: LEAVE_ANIMATION_MS,
        canGoBack: currentIndex > 0,
        onSwipeBack: () => setCurrentIndex(currentIndex - 1),
        canComplete,
        onSwipeComplete: (animateLeave) => training.handleCompleteExercise(
            currentPair.row, currentPair.exercise, currentIndex, { onDone: animateLeave }
        ),
        onBlockedComplete: () => training.showHint('Completa las repeticiones de todas las series antes de continuar.'),
    });

    if (!currentPair) return null;

    const handleCompleteClick = () => {
        training.handleCompleteExercise(currentPair.row, currentPair.exercise, currentIndex, {
            onDone: runWithLeaveAnimation,
        });
    };

    const swipeClassName = [
        'session-swipe-area',
        dragging ? 'dragging' : '',
        leaving ? 'leaving' : '',
        dragDelta > SWIPE_THRESHOLD ? 'ready' : '',
    ].filter(Boolean).join(' ');

    const swipeStyle = leaving || !dragging
        ? undefined
        : { transform: `translateX(${dragDelta}px)` };

    return (
        <>
            <div className="session-dots">
                {matchedExercises.map(({ row }, index) => (
                    <button
                        key={row.id}
                        type="button"
                        className={[
                            'session-dot',
                            index === currentIndex ? 'current' : '',
                            completedMap[row.id] ? 'done' : '',
                        ].filter(Boolean).join(' ')}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Ir al ejercicio ${index + 1}`}
                    />
                ))}
            </div>

            <div className={swipeClassName} style={swipeStyle} {...touchHandlers}>
                {dragDelta > SWIPE_THRESHOLD && (
                    <div className="session-swipe-hint right">Suelta para completar</div>
                )}
                {dragDelta < -SWIPE_THRESHOLD && currentIndex > 0 && (
                    <div className="session-swipe-hint left">Anterior</div>
                )}

                <ExerciseCard
                    exercise={currentPair.exercise}
                    row={currentPair.row}
                    index={currentIndex}
                    completed={!!completedMap[currentPair.row.id]}
                    canComplete={canComplete}
                    busy={busy}
                    setValues={setValues}
                    rpe={rpeMap[currentPair.row.id] ?? null}
                    onSetChange={training.handleSetChange}
                    onSetBlur={training.handleSetBlur}
                    onRpeChange={training.handleRpeChange}
                    onComplete={handleCompleteClick}
                    onUnmark={() => training.handleUnmarkExercise(currentPair.row)}
                />
            </div>

            <SessionActionFeedback error={actionError} hint={hint} />

            <p className="session-swipe-tip">
                Desliza a la derecha para completar · a la izquierda para volver
            </p>
        </>
    );
}

export default MobileTrainingView;

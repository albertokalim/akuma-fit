import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useIsMobile } from '../../hooks/useIsMobile.js';
import { useElapsedTime, formatElapsed } from '../../hooks/useElapsedTime.js';
import { sessionService } from '../../services/sessionService.js';
import ExerciseCard from './ExerciseCard.jsx';
import FeedbackScreen from './FeedbackScreen.jsx';

const SWIPE_THRESHOLD = 80;
const LEAVE_ANIMATION_MS = 220;

function buildInitialSetValues(fullSession) {
    const values = {};

    for (const row of fullSession.completed_exercise) {
        for (const set of row.completed_set) {
            values[`${row.exercise_template_id}:${set.set_order}`] = {
                reps: set.reps_completed,
                kg: set.kg_used,
            };
        }
    }

    return values;
}

function buildInitialCompletedMap(fullSession) {
    const completed = {};

    for (const row of fullSession.completed_exercise) {
        completed[row.exercise_template_id] = row.completed;
    }

    return completed;
}

function buildExerciseRows(fullSession) {
    const rows = {};

    for (const row of fullSession.completed_exercise) {
        rows[row.exercise_template_id] = row;
    }

    return rows;
}

function buildInitialRpeMap(fullSession) {
    const rpeMap = {};

    for (const row of fullSession.completed_exercise) {
        if (row.rpe !== null && row.rpe !== undefined) {
            rpeMap[row.exercise_template_id] = row.rpe;
        }
    }

    return rpeMap;
}

function firstIncompleteIndex(routine, fullSession) {
    const completed = buildInitialCompletedMap(fullSession);
    const index = routine.exercises.findIndex((exercise) => !completed[exercise.id]);
    return index === -1 ? 0 : index;
}

/**
 * Paso 2: pantalla de entrenamiento.
 *
 * - Móvil: un ejercicio por pantalla; se completa deslizando la tarjeta a la
 *   derecha (o con el botón). Deslizar a la izquierda vuelve al anterior.
 * - Escritorio: lista completa de ejercicios, completándose uno a uno.
 *
 * Todo lo que hace el usuario se persiste en Supabase en el momento (cada
 * serie al perder el foco, cada ejercicio al completarlo), así cerrar la
 * app o irse a otra pestaña no pierde nada: al volver, ActiveSessionLoader
 * recarga el estado persistido y esta vista se inicializa desde él, con el
 * cronómetro siguiendo desde `started_at`.
 */
function TrainingView({ session, routine, fullSession, onFinished, onCancelled }) {
    const isMobile = useIsMobile();
    const elapsedMs = useElapsedTime(session.started_at);

    const [setValues, setSetValues] = useState(() => buildInitialSetValues(fullSession));
    const [completedMap, setCompletedMap] = useState(() => buildInitialCompletedMap(fullSession));
    const [rpeMap, setRpeMap] = useState(() => buildInitialRpeMap(fullSession));
    const [currentIndex, setCurrentIndex] = useState(() => firstIncompleteIndex(routine, fullSession));
    const [phase, setPhase] = useState('training'); // 'training' | 'feedback'
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [hint, setHint] = useState(null);
    const [confirmAbandon, setConfirmAbandon] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [dragDelta, setDragDelta] = useState(0);
    const [leaving, setLeaving] = useState(false);
    const touchStartRef = useRef(null);

    const exerciseRows = useMemo(() => buildExerciseRows(fullSession), [fullSession]);
    const exercises = useMemo(() => routine.exercises || [], [routine]);
    const currentExercise = exercises[currentIndex];
    const completedCount = exercises.filter((exercise) => completedMap[exercise.id]).length;
    const progressPercent = exercises.length > 0 ? (completedCount / exercises.length) * 100 : 0;

    useEffect(() => {
        if (!hint) return undefined;
        const timeout = setTimeout(() => setHint(null), 2500);
        return () => clearTimeout(timeout);
    }, [hint]);

    const isExerciseComplete = useCallback((exercise) => {
        const sets = exercise.sets || [];
        if (sets.length === 0) return false;

        return sets.every((set) => {
            const value = setValues[`${exercise.id}:${set.order}`];
            return value && value.reps !== '' && value.reps !== null && value.reps !== undefined
                && Number(value.reps) > 0;
        });
    }, [setValues]);

    const handleSetChange = (exercise, setOrder, field, rawValue) => {
        const key = `${exercise.id}:${setOrder}`;
        setSetValues((prev) => ({
            ...prev,
            [key]: { ...(prev[key] || {}), [field]: rawValue },
        }));
    };

    const handleSetBlur = async (exercise, setTemplate) => {
        const row = exerciseRows[exercise.id];
        if (!row) return;

        const value = setValues[`${exercise.id}:${setTemplate.order}`];
        if (!value) return;

        try {
            await sessionService.saveSet(row.id, setTemplate.order, {
                reps: value.reps === '' || value.reps === undefined ? null : Number(value.reps),
                kg: value.kg === '' || value.kg === undefined ? null : Number(value.kg),
                type: setTemplate.type,
            });
        } catch (err) {
            setActionError(`No se pudo guardar la serie: ${err.message}`);
        }
    };

    const buildSummary = useCallback((completedOverride, feedback) => {
        const completed = completedOverride || completedMap;
        const endedAt = new Date();
        let totalSets = 0;
        let completedSets = 0;
        let totalVolume = 0;

        for (const exercise of exercises) {
            for (const set of exercise.sets || []) {
                totalSets += 1;
                const value = setValues[`${exercise.id}:${set.order}`];
                const reps = value?.reps ? Number(value.reps) : 0;
                const kg = value?.kg ? Number(value.kg) : 0;

                if (reps > 0) {
                    completedSets += 1;
                    totalVolume += reps * kg;
                }
            }
        }

        return {
            routineTitle: routine.title,
            durationMs: endedAt.getTime() - new Date(session.started_at).getTime(),
            exercisesTotal: exercises.length,
            exercisesCompleted: exercises.filter((exercise) => completed[exercise.id]).length,
            totalSets,
            completedSets,
            totalVolume,
            feeling: feedback?.feeling ?? null,
            notes: feedback?.notes ?? null,
            exercises: exercises.map((exercise) => ({
                name: exercise.exercise_name,
                completed: !!completed[exercise.id],
                rpe: rpeMap[exercise.id] ?? null,
                sets: (exercise.sets || []).map((set) => {
                    const value = setValues[`${exercise.id}:${set.order}`];
                    return {
                        order: set.order,
                        reps: value?.reps ?? null,
                        kg: value?.kg ?? null,
                        type: set.type,
                    };
                }),
            })),
        };
    }, [exercises, setValues, completedMap, rpeMap, routine, session.started_at]);

    const advanceAfterComplete = (fromIndex, completed) => {
        const nextIndex = exercises.findIndex(
            (exercise, index) => index > fromIndex && !completed[exercise.id]
        );

        if (nextIndex !== -1) {
            setCurrentIndex(nextIndex);
            return;
        }

        const anyIncomplete = exercises.findIndex((exercise) => !completed[exercise.id]);
        if (anyIncomplete !== -1) {
            setCurrentIndex(anyIncomplete);
        }
    };

    const handleRpeChange = (exercise, value) => {
        setRpeMap((prev) => ({ ...prev, [exercise.id]: value }));
    };

    const handleCompleteExercise = async (exercise, index) => {
        if (!isExerciseComplete(exercise)) {
            setHint('Completa las repeticiones de todas las series antes de continuar.');
            return;
        }

        const row = exerciseRows[exercise.id];
        if (!row) return;

        setBusy(true);
        setActionError(null);

        try {
            await sessionService.setExerciseCompleted(row.id, true, rpeMap[exercise.id] ?? null);
            const updatedCompleted = { ...completedMap, [exercise.id]: true };
            setCompletedMap(updatedCompleted);

            const allDone = exercises.every((item) => updatedCompleted[item.id]);

            if (allDone) {
                if (isMobile) {
                    setLeaving(true);
                    setTimeout(() => {
                        setLeaving(false);
                        setDragDelta(0);
                        setPhase('feedback');
                    }, LEAVE_ANIMATION_MS);
                } else {
                    setPhase('feedback');
                }
                return;
            }

            if (isMobile) {
                setLeaving(true);
                setTimeout(() => {
                    setLeaving(false);
                    setDragDelta(0);
                    advanceAfterComplete(index, updatedCompleted);
                }, LEAVE_ANIMATION_MS);
            } else {
                advanceAfterComplete(index, updatedCompleted);
            }
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const handleFinishSession = async (feedback) => {
        setBusy(true);
        setActionError(null);

        try {
            await sessionService.finish(session.id, feedback);
            onFinished(buildSummary(completedMap, feedback));
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const handleUnmarkExercise = async (exercise) => {
        const row = exerciseRows[exercise.id];
        if (!row) return;

        setBusy(true);
        setActionError(null);

        try {
            await sessionService.setExerciseCompleted(row.id, false);
            setCompletedMap((prev) => ({ ...prev, [exercise.id]: false }));
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const handleAbandon = async () => {
        setBusy(true);

        try {
            await sessionService.cancel(session.id);
            onCancelled();
        } catch (err) {
            setActionError(err.message);
            setBusy(false);
            setConfirmAbandon(false);
        }
    };

    const handleTouchStart = (event) => {
        if (event.target.closest('input, button, textarea, select, video')) return;
        touchStartRef.current = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
        };
    };

    const handleTouchMove = (event) => {
        if (!touchStartRef.current) return;

        const deltaX = event.touches[0].clientX - touchStartRef.current.x;
        const deltaY = event.touches[0].clientY - touchStartRef.current.y;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            setDragging(true);
            setDragDelta(deltaX);
        }
    };

    const handleTouchEnd = () => {
        if (!touchStartRef.current) return;

        const deltaX = dragDelta;
        touchStartRef.current = null;
        setDragging(false);

        if (deltaX > SWIPE_THRESHOLD) {
            if (isExerciseComplete(currentExercise)) {
                handleCompleteExercise(currentExercise, currentIndex);
                return;
            }
            setDragDelta(0);
            setHint('Completa las repeticiones de todas las series antes de continuar.');
        } else if (deltaX < -SWIPE_THRESHOLD && currentIndex > 0) {
            setDragDelta(0);
            setCurrentIndex(currentIndex - 1);
        } else {
            setDragDelta(0);
        }
    };

    if (exercises.length === 0) {
        return (
            <div className="session-page">
                <div className="page-container">
                    <h1 className="page-title">Entrenar</h1>
                    <div className="empty-state">
                        <p>Esta rutina no tiene ejercicios. Contacta con tu coach.</p>
                    </div>
                    <button className="btn-outline" onClick={() => setConfirmAbandon(true)}>
                        Abandonar sesión
                    </button>
                </div>
                {renderAbandonModal()}
            </div>
        );
    }

    function renderAbandonModal() {
        if (!confirmAbandon) return null;

        return (
            <div className="modal-overlay" onClick={() => setConfirmAbandon(false)}>
                <div className="modal-content session-abandon-modal" onClick={(event) => event.stopPropagation()}>
                    <div className="modal-header">
                        <h2 className="modal-title">Abandonar sesión</h2>
                        <button className="btn-icon" onClick={() => setConfirmAbandon(false)}>
                            <FiX size={20} />
                        </button>
                    </div>
                    <div className="modal-body">
                        <p className="session-abandon-text">
                            ¿Seguro que quieres abandonar la sesión? Se perderá el progreso
                            no completado.
                        </p>
                        <div className="session-abandon-actions">
                            <button className="btn-secondary" onClick={() => setConfirmAbandon(false)} disabled={busy}>
                                Seguir entrenando
                            </button>
                            <button className="btn-danger" onClick={handleAbandon} disabled={busy}>
                                {busy ? 'Abandonando...' : 'Abandonar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const topBar = (
        <div className="session-topbar">
            <div className="session-topbar-info">
                <span className="session-routine-name">{routine.title}</span>
                <span className="session-timer">{formatElapsed(elapsedMs)}</span>
            </div>
            <button className="btn-outline btn-sm" onClick={() => setConfirmAbandon(true)} disabled={busy}>
                <FiX size={14} />
                <span>Abandonar</span>
            </button>
            <div className="session-progress">
                <div className="session-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="session-progress-label">
                {completedCount}/{exercises.length} ejercicios
            </span>
        </div>
    );

    const feedback = (
        <>
            {actionError && <div className="error-message">{actionError}</div>}
            {hint && <div className="session-hint">{hint}</div>}
        </>
    );

    if (phase === 'feedback') {
        return (
            <div className="session-page session-training">
                {topBar}
                {actionError && <div className="error-message">{actionError}</div>}
                <FeedbackScreen busy={busy} onSubmit={handleFinishSession} />
            </div>
        );
    }

    if (isMobile) {
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
            <div className="session-page session-training">
                {topBar}

                <div className="session-dots">
                    {exercises.map((exercise, index) => (
                        <button
                            key={exercise.id}
                            type="button"
                            className={[
                                'session-dot',
                                index === currentIndex ? 'current' : '',
                                completedMap[exercise.id] ? 'done' : '',
                            ].filter(Boolean).join(' ')}
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`Ir al ejercicio ${index + 1}`}
                        />
                    ))}
                </div>

                <div
                    className={swipeClassName}
                    style={swipeStyle}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {dragDelta > SWIPE_THRESHOLD && (
                        <div className="session-swipe-hint right">Suelta para completar</div>
                    )}
                    {dragDelta < -SWIPE_THRESHOLD && currentIndex > 0 && (
                        <div className="session-swipe-hint left">Anterior</div>
                    )}

                    <ExerciseCard
                        exercise={currentExercise}
                        index={currentIndex}
                        completed={!!completedMap[currentExercise.id]}
                        canComplete={isExerciseComplete(currentExercise)}
                        busy={busy}
                        setValues={setValues}
                        rpe={rpeMap[currentExercise.id] ?? null}
                        onSetChange={handleSetChange}
                        onSetBlur={handleSetBlur}
                        onRpeChange={handleRpeChange}
                        onComplete={() => handleCompleteExercise(currentExercise, currentIndex)}
                        onUnmark={() => handleUnmarkExercise(currentExercise)}
                    />
                </div>

                {feedback}

                <p className="session-swipe-tip">
                    Desliza a la derecha para completar · a la izquierda para volver
                </p>

                {renderAbandonModal()}
            </div>
        );
    }

    return (
        <div className="session-page session-training">
            {topBar}

            {feedback}

            <div className="session-exercises-list">
                {exercises.map((exercise, index) => (
                    <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        index={index}
                        completed={!!completedMap[exercise.id]}
                        canComplete={isExerciseComplete(exercise)}
                        busy={busy}
                        setValues={setValues}
                        rpe={rpeMap[exercise.id] ?? null}
                        onSetChange={handleSetChange}
                        onSetBlur={handleSetBlur}
                        onRpeChange={handleRpeChange}
                        onComplete={() => handleCompleteExercise(exercise, index)}
                        onUnmark={() => handleUnmarkExercise(exercise)}
                    />
                ))}
            </div>

            {renderAbandonModal()}
        </div>
    );
}

export default TrainingView;

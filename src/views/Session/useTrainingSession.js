import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sessionService } from '../../services/sessionService.js';
import {
    matchExerciseRows,
    buildInitialSetValues,
    buildInitialCompletedMap,
    buildInitialRpeMap,
    firstIncompleteIndex,
    buildSummary,
} from './sessionMappers.js';

const HINT_DURATION_MS = 2500;

 
export function useTrainingSession({ session, routine, fullSession, onFinished, onCancelled }) {
    const matchedExercises = useMemo(
        () => matchExerciseRows(routine.exercises || [], fullSession.completed_exercise || []),
        [routine, fullSession]
    );

    const [setValues, setSetValues] = useState(() => buildInitialSetValues(matchedExercises));
    const [completedMap, setCompletedMap] = useState(() => buildInitialCompletedMap(matchedExercises));
    const [rpeMap, setRpeMap] = useState(() => buildInitialRpeMap(matchedExercises));
    const [currentIndex, setCurrentIndex] = useState(() => firstIncompleteIndex(matchedExercises));
    const [phase, setPhase] = useState('training'); 
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [hint, setHint] = useState(null);
    const [confirmAbandon, setConfirmAbandon] = useState(false);

    const lastSavedValuesRef = useRef(buildInitialSetValues(matchedExercises));

    useEffect(() => {
        if (!hint) return undefined;
        const timeout = setTimeout(() => setHint(null), HINT_DURATION_MS);
        return () => clearTimeout(timeout);
    }, [hint]);

    const currentPair = matchedExercises[currentIndex] || null;
    const completedCount = matchedExercises.filter(({ row }) => completedMap[row.id]).length;
    const progressPercent = matchedExercises.length > 0
        ? (completedCount / matchedExercises.length) * 100
        : 0;

    const isExerciseComplete = useCallback((row, exercise) => {
        const sets = exercise.sets || [];
        if (sets.length === 0) return false;

        return sets.every((set) => {
            const value = setValues[`${row.id}:${set.order}`];
            return value && value.reps !== '' && value.reps !== null && value.reps !== undefined
                && Number(value.reps) > 0;
        });
    }, [setValues]);

    const handleSetChange = useCallback((row, setOrder, field, rawValue) => {
        const key = `${row.id}:${setOrder}`;
        setSetValues((prev) => ({
            ...prev,
            [key]: { ...(prev[key] || {}), [field]: rawValue },
        }));
    }, []);

    const handleSetBlur = useCallback(async (row, setTemplate) => {
        const key = `${row.id}:${setTemplate.order}`;
        const value = setValues[key];
        if (!value) return;

        try {
            await sessionService.saveSet(row.id, setTemplate.order, {
                reps: value.reps === '' || value.reps === undefined ? null : Number(value.reps),
                kg: value.kg === '' || value.kg === undefined ? null : Number(value.kg),
                type: setTemplate.type,
            });
            lastSavedValuesRef.current[key] = value;
        } catch (err) {
            setSetValues((prev) => ({ ...prev, [key]: lastSavedValuesRef.current[key] || {} }));
            setActionError(`No se pudo guardar la serie: ${err.message}`);
        }
    }, [setValues]);

    const handleRpeChange = useCallback((row, value) => {
        setRpeMap((prev) => ({ ...prev, [row.id]: value }));
    }, []);

    const advanceAfterComplete = useCallback((fromIndex, completed) => {
        const nextIndex = matchedExercises.findIndex(
            ({ row }, index) => index > fromIndex && !completed[row.id]
        );

        if (nextIndex !== -1) {
            setCurrentIndex(nextIndex);
            return;
        }

        const anyIncomplete = matchedExercises.findIndex(({ row }) => !completed[row.id]);
        if (anyIncomplete !== -1) {
            setCurrentIndex(anyIncomplete);
        }
    }, [matchedExercises]);

    const handleCompleteExercise = useCallback(async (row, exercise, index, { onDone } = {}) => {
        if (!isExerciseComplete(row, exercise)) {
            setHint('Completa las repeticiones de todas las series antes de continuar.');
            return;
        }

        setBusy(true);
        setActionError(null);

        try {
            await sessionService.setExerciseCompleted(row.id, true, rpeMap[row.id] ?? null);
            const updatedCompleted = { ...completedMap, [row.id]: true };
            setCompletedMap(updatedCompleted);

            const allDone = matchedExercises.every(({ row: r }) => updatedCompleted[r.id]);

            if (allDone) {
                if (onDone) {
                    onDone(() => setPhase('feedback'));
                } else {
                    setPhase('feedback');
                }
                return;
            }

            if (onDone) {
                onDone(() => advanceAfterComplete(index, updatedCompleted));
            } else {
                advanceAfterComplete(index, updatedCompleted);
            }
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusy(false);
        }
    }, [isExerciseComplete, rpeMap, completedMap, matchedExercises, advanceAfterComplete]);

    const handleUnmarkExercise = useCallback(async (row) => {
        setBusy(true);
        setActionError(null);

        try {
            await sessionService.setExerciseCompleted(row.id, false);
            setCompletedMap((prev) => ({ ...prev, [row.id]: false }));
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusy(false);
        }
    }, []);

    const handleFinishSession = useCallback(async (feedback) => {
        setBusy(true);
        setActionError(null);

        try {
            await sessionService.finish(session.id, feedback);
            onFinished(buildSummary({
                matchedExercises,
                routineTitle: routine.title,
                startedAt: session.started_at,
                setValues,
                completedMap,
                rpeMap,
                feedback,
            }));
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusy(false);
        }
    }, [session, routine, matchedExercises, setValues, completedMap, rpeMap, onFinished]);

    const handleAbandon = useCallback(async () => {
        setBusy(true);

        try {
            await sessionService.cancel(session.id);
            onCancelled();
        } catch (err) {
            setActionError(err.message);
            setBusy(false);
            setConfirmAbandon(false);
        }
    }, [session, onCancelled]);

    return {
        matchedExercises,
        currentPair,
        currentIndex,
        setCurrentIndex,
        phase,
        busy,
        actionError,
        hint,
        showHint: setHint,
        confirmAbandon,
        setConfirmAbandon,
        completedCount,
        progressPercent,
        completedMap,
        rpeMap,
        setValues,
        isExerciseComplete,
        handleSetChange,
        handleSetBlur,
        handleRpeChange,
        handleCompleteExercise,
        handleUnmarkExercise,
        handleFinishSession,
        handleAbandon,
    };
}

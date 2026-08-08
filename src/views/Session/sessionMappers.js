/**
 * Funciones puras para transformar los datos crudos de Supabase
 * (`routine.exercises` + `training_session.completed_exercise`) al estado
 * interno que usa `useTrainingSession`. Se extraen aquí (en vez de vivir
 * como funciones privadas dentro de TrainingView.jsx) para poder testearlas
 * sin montar componentes ni simular DOM/gestos táctiles.
 *
 * Importante: el estado interno de la sesión se indexa por
 * `completed_exercise.id` (la fila real de esta sesión), NO por
 * `exercise_template_id`. Antes se usaba el id de la plantilla como única
 * clave en todo TrainingView; eso funciona mientras una rutina no repita el
 * mismo ejercicio dos veces (hoy lo impide `CreateRoutine`), pero es una
 * regla que sólo vive en la UI del coach, no en el modelo de datos ni en el
 * servicio. Si esa regla cambiara, dos filas `completed_exercise` distintas
 * colisionarían en la misma clave. Indexar por el id de la fila de sesión
 * es la identidad correcta y evita ese acoplamiento implícito.
 */

/**
 * Empareja cada ejercicio de la plantilla de la rutina con su fila
 * `completed_exercise` correspondiente en esta sesión.
 *
 * Se empareja por `exercise_template_id` (no por posición/índice) porque
 * es la única referencia estable si en el futuro una rutina se edita
 * después de haber empezado sesiones sobre ella (añadir/quitar ejercicios
 * desordenaría los índices, pero el id de plantilla de un ejercicio ya
 * empezado se mantiene).
 */
export function matchExerciseRows(routineExercises, completedExerciseRows) {
    const rowsByTemplateId = new Map();
    for (const row of completedExerciseRows) {
        rowsByTemplateId.set(row.exercise_template_id, row);
    }

    return routineExercises
        .map((exercise) => ({ exercise, row: rowsByTemplateId.get(exercise.id) || null }))
        .filter((pair) => pair.row !== null);
}

export function buildInitialSetValues(matchedExercises) {
    const values = {};

    for (const { row } of matchedExercises) {
        for (const set of row.completed_set) {
            values[`${row.id}:${set.set_order}`] = {
                reps: set.reps_completed,
                kg: set.kg_used,
            };
        }
    }

    return values;
}

export function buildInitialCompletedMap(matchedExercises) {
    const completed = {};

    for (const { row } of matchedExercises) {
        completed[row.id] = row.completed;
    }

    return completed;
}

export function buildInitialRpeMap(matchedExercises) {
    const rpeMap = {};

    for (const { row } of matchedExercises) {
        if (row.rpe !== null && row.rpe !== undefined) {
            rpeMap[row.id] = row.rpe;
        }
    }

    return rpeMap;
}

export function firstIncompleteIndex(matchedExercises) {
    const index = matchedExercises.findIndex(({ row }) => !row.completed);
    return index === -1 ? 0 : index;
}

/**
 * Calcula el resumen final de la sesión (duración, series/ejercicios
 * completados, volumen total y desglose por ejercicio) a partir del estado
 * en memoria de la vista de entrenamiento.
 */
export function buildSummary({
    matchedExercises,
    routineTitle,
    startedAt,
    setValues,
    completedMap,
    rpeMap,
    feedback,
}) {
    const endedAt = new Date();
    let totalSets = 0;
    let completedSets = 0;
    let totalVolume = 0;

    const exercisesSummary = matchedExercises.map(({ exercise, row }) => {
        const sets = (exercise.sets || []).map((set) => {
            totalSets += 1;
            const value = setValues[`${row.id}:${set.order}`];
            const reps = value?.reps ? Number(value.reps) : 0;
            const kg = value?.kg ? Number(value.kg) : 0;

            if (reps > 0) {
                completedSets += 1;
                totalVolume += reps * kg;
            }

            return {
                order: set.order,
                reps: value?.reps ?? null,
                kg: value?.kg ?? null,
                type: set.type,
            };
        });

        return {
            name: exercise.exercise_name,
            completed: !!completedMap[row.id],
            rpe: rpeMap[row.id] ?? null,
            sets,
        };
    });

    return {
        routineTitle,
        durationMs: endedAt.getTime() - new Date(startedAt).getTime(),
        exercisesTotal: matchedExercises.length,
        exercisesCompleted: exercisesSummary.filter((exercise) => exercise.completed).length,
        totalSets,
        completedSets,
        totalVolume,
        feeling: feedback?.feeling ?? null,
        notes: feedback?.notes ?? null,
        exercises: exercisesSummary,
    };
}

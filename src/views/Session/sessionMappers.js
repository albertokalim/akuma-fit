 

 
/**
 * Empareja los ejercicios de una rutina con sus filas de `completed_exercise`,
 * devolviendo solo los que tienen fila.
 *
 * @param {Array<Object>} routineExercises - Ejercicios de la rutina.
 * @param {Array<Object>} completedExerciseRows - Filas completadas.
 * @returns {Array<{exercise: Object, row: Object}>} Pares emparejados.
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

/**
 * Construye el estado inicial de valores de series desde las series
 * completadas.
 *
 * @param {Array<{row: Object}>} matchedExercises - Ejercicios emparejados.
 * @returns {Object} Mapa clave -> { reps, kg }.
 */
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

/**
 * Construye el mapa inicial de ejercicios completados.
 *
 * @param {Array<{row: Object}>} matchedExercises - Ejercicios emparejados.
 * @returns {Object} Mapa rowId -> completado.
 */
export function buildInitialCompletedMap(matchedExercises) {
    const completed = {};

    for (const { row } of matchedExercises) {
        completed[row.id] = row.completed;
    }

    return completed;
}

/**
 * Construye el mapa inicial de RPE por ejercicio.
 *
 * @param {Array<{row: Object}>} matchedExercises - Ejercicios emparejados.
 * @returns {Object} Mapa rowId -> rpe.
 */
export function buildInitialRpeMap(matchedExercises) {
    const rpeMap = {};

    for (const { row } of matchedExercises) {
        if (row.rpe !== null && row.rpe !== undefined) {
            rpeMap[row.id] = row.rpe;
        }
    }

    return rpeMap;
}

/**
 * Devuelve el índice del primer ejercicio no completado (o 0 si no hay).
 *
 * @param {Array<{row: Object}>} matchedExercises - Ejercicios emparejados.
 * @returns {number} Índice.
 */
export function firstIncompleteIndex(matchedExercises) {
    const index = matchedExercises.findIndex(({ row }) => !row.completed);
    return index === -1 ? 0 : index;
}

 
/**
 * Construye el resumen final de la sesión: duración, ejercicios/series
 * completados, volumen total, sensación y desglose por ejercicio.
 *
 * @param {Object} params - Parámetros.
 * @returns {Object} Resumen de la sesión.
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

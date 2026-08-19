 

 
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

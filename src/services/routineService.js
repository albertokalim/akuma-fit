import { supabase } from '../supabaseClient.js';

const ROUTINE_WITH_EXERCISES_SELECT = `
    *,
    routine_has_exercise_template(
        position,
        exercise_template(
            *,
            exercise_template_has_set_template(
                set_template(*)
            )
        )
    )
`;

// Variante para filtrar por cliente asignado: el embed con !inner hace que
// sólo se devuelvan rutinas con asignación para ese perfil.
const ROUTINES_BY_CLIENT_SELECT = `
    *,
    profile_has_routine!inner(profile),
    routine_has_exercise_template(
        position,
        exercise_template(
            *,
            exercise_template_has_set_template(
                set_template(*)
            )
        )
    )
`;

function mapRoutineExercises(routine) {
    // El orden de un embed anidado no está garantizado por PostgREST sin un
    // `.order()` explícito sobre esa relación (a diferencia de `set_template`,
    // que sí lo tiene). Aquí se ordena en cliente por la columna `position`
    // persistida en `routine_has_exercise_template`, así el orden que ve el
    // cliente coincide siempre con el que definió el coach.
    const exercises = (routine.routine_has_exercise_template || [])
        .slice()
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map(rel => rel.exercise_template)
        .filter(Boolean)
        .map(exercise => {
            const sets = (exercise.exercise_template_has_set_template || [])
                .map(rel => rel.set_template)
                .filter(Boolean)
                .sort((a, b) => a.order - b.order);

            const exerciseRest = { ...exercise };
            delete exerciseRest.exercise_template_has_set_template;
            return { ...exerciseRest, sets };
        });

    const routineRest = { ...routine };
    delete routineRest.profile_has_routine;
    delete routineRest.routine_has_exercise_template;
    return { ...routineRest, exercises };
}

export const routineService = {
    async getClients() {
        const { data, error } = await supabase
            .from('profile')
            .select('id, name, surname')
            .eq('role', 'client')
            .order('name');

        if (error) throw new Error(error.message);
        return data || [];
    },

    async create(routineData) {
        const { data: routine, error: routineError } = await supabase
            .from('routine')
            .insert({
                title: routineData.title,
                coach_comment: routineData.coachComment,
                creator: routineData.creatorId,
            })
            .select()
            .single();

        if (routineError) throw new Error(routineError.message);

        // Si hay un cliente, asignar la rutina PRIMERO (requerido por RLS)
        if (routineData.clientId) {
            const { error: assignError } = await supabase
                .from('profile_has_routine')
                .insert({
                    profile: routineData.clientId,
                    routine: routine.id,
                });

            if (assignError) throw new Error(assignError.message);
        }

        const exercises = routineData.exercises || [];

        if (exercises.length > 0) {
            // Vincular todos los ejercicios a la rutina en una sola llamada,
            // persistiendo `position` según el orden en que el coach los dejó
            // en el formulario (ver mapRoutineExercises: es la columna por la
            // que se ordena al leer, ya que PostgREST no garantiza el orden
            // de un embed sin ella).
            const { error: relationError } = await supabase
                .from('routine_has_exercise_template')
                .insert(exercises.map((exercise, index) => ({
                    routine: routine.id,
                    exercise_template: exercise.id,
                    position: index + 1,
                })));

            if (relationError) throw new Error(relationError.message);

            // Aplanar todas las series de todos los ejercicios para insertarlas en un único batch,
            // manteniendo aparte a qué ejercicio pertenece cada una (por índice) para no incluir
            // ese dato en el propio insert (la tabla set_template no tiene columna exercise_id).
            const exerciseIdsBySet = [];
            const setRows = exercises.flatMap(exercise =>
                (exercise.sets || []).map(set => {
                    exerciseIdsBySet.push(exercise.id);
                    return {
                        order: set.order,
                        reps: set.reps,
                        kg: set.kg,
                        type: set.type,
                    };
                })
            );

            if (setRows.length > 0) {
                const { data: createdSets, error: setError } = await supabase
                    .from('set_template')
                    .insert(setRows)
                    .select();

                if (setError) throw new Error(setError.message);

                // Postgres/PostgREST devuelve las filas en el mismo orden en que
                // se insertaron para un único INSERT con múltiples VALUES, por lo
                // que podemos volver a asociarlas por índice con su ejercicio.
                const links = createdSets.map((setTemplate, index) => ({
                    exercise_template: exerciseIdsBySet[index],
                    set_template: setTemplate.id,
                }));

                const { error: linkError } = await supabase
                    .from('exercise_template_has_set_template')
                    .insert(links);

                if (linkError) throw new Error(linkError.message);
            }
        }

        return routine;
    },

    async getByClient(clientId) {
        // Una sola consulta con embeds anidados en vez de N+1 queries secuenciales
        const { data: routines, error } = await supabase
            .from('routine')
            .select(ROUTINES_BY_CLIENT_SELECT)
            .eq('profile_has_routine.profile', clientId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        return (routines || []).map(mapRoutineExercises);
    },

    async getById(routineId) {
        const { data: routine, error } = await supabase
            .from('routine')
            .select(ROUTINE_WITH_EXERCISES_SELECT)
            .eq('id', routineId)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return routine ? mapRoutineExercises(routine) : null;
    },
};

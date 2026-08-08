import { supabase } from '../supabaseClient.js';

export const sessionService = {
    async getActive(profileId) {
        const { data, error } = await supabase
            .from('training_session')
            .select('id, routine_id, started_at, routine(id, title)')
            .eq('profile_id', profileId)
            .eq('status', 'active')
            .order('started_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return data || null;
    },

    async create(profileId, routine) {
        // Se apoya en la función Postgres `create_training_session`
        // (supabase/migrations/20260808120000_session_hardening.sql), que
        // inserta la training_session y sus completed_exercise en una única
        // transacción. Antes esto eran dos inserts secuenciales desde el
        // cliente: si el segundo fallaba, quedaba una sesión "activa" sin
        // ejercicios asociados (zombi, imposible de completar o cancelar
        // correctamente desde la UI).
        const { data: session, error } = await supabase
            .rpc('create_training_session', {
                p_profile_id: profileId,
                p_routine_id: routine.id,
            })
            .select('id, routine_id, started_at')
            .single();

        if (error) throw new Error(error.message);
        return session;
    },

    async loadFull(sessionId) {
        const { data, error } = await supabase
            .from('training_session')
            .select(`
                *,
                routine(id, title),
                completed_exercise(
                    *,
                    completed_set(*)
                )
            `)
            .eq('id', sessionId)
            .order('exercise_order', { referencedTable: 'completed_exercise' })
            .order('set_order', { referencedTable: 'completed_exercise.completed_set' })
            .maybeSingle();

        if (error) throw new Error(error.message);
        return data || null;
    },

    async saveSet(completedExerciseId, setOrder, values) {
        const { error } = await supabase
            .from('completed_set')
            .upsert({
                completed_exercise_id: completedExerciseId,
                set_order: setOrder,
                reps_completed: values.reps,
                kg_used: values.kg,
                type: values.type,
            }, { onConflict: 'completed_exercise_id,set_order' });

        if (error) throw new Error(error.message);
    },

    async setExerciseCompleted(completedExerciseId, completed, rpe) {
        const { error } = await supabase
            .from('completed_exercise')
            .update({
                completed,
                completed_at: completed ? new Date().toISOString() : null,
                ...(rpe !== undefined ? { rpe } : {}),
            })
            .eq('id', completedExerciseId);

        if (error) throw new Error(error.message);
    },

    async finish(sessionId, feedback = {}) {
        const { error } = await supabase
            .from('training_session')
            .update({
                status: 'completed',
                completed: true,
                ended_at: new Date().toISOString(),
                feeling: feedback.feeling ?? null,
                notes: feedback.notes ?? null,
            })
            .eq('id', sessionId);

        if (error) throw new Error(error.message);
    },

    async cancel(sessionId) {
        const { error } = await supabase
            .from('training_session')
            .update({
                status: 'cancelled',
                ended_at: new Date().toISOString(),
            })
            .eq('id', sessionId);

        if (error) throw new Error(error.message);
    },
};

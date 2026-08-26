import { supabase } from '../supabaseClient.js';

/**
 * Servicio de acceso a datos de las sesiones de entrenamiento
 * (`training_session`).
 */
export const sessionService = {
    /**
     * Obtiene la sesión activa de un perfil, si existe.
     *
     * @param {number} profileId - Id del perfil.
     * @returns {Promise<Object|null>} Sesión activa o `null`.
     */
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

    /**
     * Crea una sesión de entrenamiento para un perfil y una rutina.
     *
     * @param {number} profileId - Id del perfil.
     * @param {Object} routine - Rutina (con `id`).
     * @returns {Promise<Object>} Sesión creada.
     */
    async create(profileId, routine) {
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

    /**
     * Carga una sesión completa con sus ejercicios y series completados.
     *
     * @param {number} sessionId - Id de la sesión.
     * @returns {Promise<Object|null>} Sesión completa o `null`.
     */
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

    /**
     * Guarda (upsert) una serie completada de un ejercicio de la sesión.
     *
     * @param {number} completedExerciseId - Id del ejercicio completado.
     * @param {number} setOrder - Orden de la serie.
     * @param {Object} values - Valores (`reps`, `kg`, `type`).
     */
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

    /**
     * Marca un ejercicio como completado (o no), registrando el RPE.
     *
     * @param {number} completedExerciseId - Id del ejercicio completado.
     * @param {boolean} completed - Estado de completado.
     * @param {number} [rpe] - Esfuerzo percibido (RPE).
     */
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

    /**
     * Finaliza una sesión, registrando el feedback (sensación y notas).
     *
     * @param {number} sessionId - Id de la sesión.
     * @param {Object} [feedback] - Feedback (`feeling`, `notes`).
     */
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

    /**
     * Cancela una sesión.
     *
     * @param {number} sessionId - Id de la sesión.
     */
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

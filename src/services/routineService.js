import { supabase } from '../supabaseClient.js';

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
        console.log('Creating routine with data:', routineData);
        
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
        
        console.log('Routine created:', routine);

        // Si hay un cliente, asignar la rutina PRIMERO (requerido por RLS)
        if (routineData.clientId) {
            console.log('Assigning routine to client:', { routineId: routine.id, clientId: routineData.clientId });
            
            const { error: assignError } = await supabase
                .from('profile_has_routine')
                .insert({
                    profile: routineData.clientId,
                    routine: routine.id,
                });

            if (assignError) {
                console.error('Error assigning routine to client:', assignError);
                throw new Error(assignError.message);
            }
            
            console.log('Routine assigned to client successfully');
        }

        for (const exercise of routineData.exercises) {
            console.log('Linking exercise to routine:', { routineId: routine.id, exerciseId: exercise.id });
            
            const { error: relationError } = await supabase
                .from('routine_has_exercise_template')
                .insert({
                    routine: routine.id,
                    exercise_template: exercise.id,
                });

            if (relationError) {
                console.error('Error linking exercise:', relationError);
                throw new Error(relationError.message);
            }
            
            console.log('Exercise linked successfully');

            for (const set of exercise.sets) {
                const { data: setTemplate, error: setError } = await supabase
                    .from('set_template')
                    .insert({
                        order: set.order,
                        reps: set.reps,
                        kg: set.kg,
                        type: set.type,
                    })
                    .select()
                    .single();

                if (setError) throw new Error(setError.message);

                await supabase
                    .from('exercise_template_has_set_template')
                    .insert({
                        exercise_template: exercise.id,
                        set_template: setTemplate.id,
                    });
            }
        }

        console.log('Routine creation completed successfully');

        return routine;
    },

    async getByClient(clientId) {
        const { data, error } = await supabase
            .from('profile_has_routine')
            .select(`
                routine:routine_id (
                    id,
                    title,
                    coach_comment,
                    created_at,
                    routine_has_exercise_template (
                        exercise_template:exercise_template_id (
                            id,
                            exercise_name,
                            category,
                            description,
                            comments,
                            exercise_template_has_set_template (
                                set_template:set_template_id (
                                    id,
                                    order,
                                    reps,
                                    kg,
                                    type
                                )
                            )
                        )
                    )
                )
            `)
            .eq('profile', clientId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data?.map(item => item.routine) || [];
    },
};

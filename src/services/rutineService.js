import { supabase } from '../supabaseClient.js';
import { getCurrentProfile } from '../utils/auth.js';

export const rutineService = {
    async create(rutineData) {
        const profile = await getCurrentProfile();

        const { data: rutine, error: rutineError } = await supabase
            .from('rutine')
            .insert({
                title: rutineData.title,
                coach_comment: rutineData.coachComment,
                creator: profile.id,
            })
            .select()
            .single();

        if (rutineError) throw new Error(rutineError.message);

        for (const exercise of rutineData.exercises) {
            const { data: exerciseTemplate, error: exerciseError } = await supabase
                .from('exercise_template')
                .insert({
                    exercise_name: exercise.name,
                    description: exercise.description,
                    comments: exercise.comments,
                    category: exercise.category,
                    creator: profile.id,
                })
                .select()
                .single();

            if (exerciseError) throw new Error(exerciseError.message);

            await supabase
                .from('rutine_has_exercise_template')
                .insert({
                    rutine: rutine.id,
                    exercise_template: exerciseTemplate.id,
                });

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
                        exercise_template: exerciseTemplate.id,
                        set_template: setTemplate.id,
                    });
            }
        }

        return rutine;
    },
};

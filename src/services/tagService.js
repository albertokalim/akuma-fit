import { supabase } from '../supabaseClient.js';

export const tagService = {
    async getAll() {
        const { data, error } = await supabase
            .from('tag')
            .select('*')
            .order('name');

        if (error) throw new Error(error.message);
        return data || [];
    },

    async create(name, category = null) {
        const { data, error } = await supabase
            .from('tag')
            .insert({ name, category })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                const { data: existing } = await supabase
                    .from('tag')
                    .select('*')
                    .eq('name', name)
                    .single();
                return existing;
            }
            throw new Error(error.message);
        }
        return data;
    },

    async getByExercise(exerciseId) {
        const { data, error } = await supabase
            .from('exercise_template_has_tag')
            .select(`
                tag:tag (
                    id,
                    name,
                    category
                )
            `)
            .eq('exercise_template', exerciseId);

        if (error) throw new Error(error.message);
        return data?.map(item => item.tag).filter(Boolean) || [];
    },

    async addTagToExercise(exerciseId, tagId) {
        const { error } = await supabase
            .from('exercise_template_has_tag')
            .insert({
                exercise_template: exerciseId,
                tag: tagId,
            });

        if (error && error.code !== '23505') {
            throw new Error(error.message);
        }
    },

    async removeTagFromExercise(exerciseId, tagId) {
        const { error } = await supabase
            .from('exercise_template_has_tag')
            .delete()
            .eq('exercise_template', exerciseId)
            .eq('tag', tagId);

        if (error) throw new Error(error.message);
    },
};

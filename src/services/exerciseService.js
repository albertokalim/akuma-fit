import { supabase } from '../supabaseClient.js';
import { getCurrentProfile } from '../utils/auth.js';

const BUCKET_NAME = 'exercise-video';

export const exerciseService = {
    async create(exerciseData) {
        const profile = await getCurrentProfile();

        const { data, error } = await supabase
            .from('exercise_template')
            .insert({
                exercise_name: exerciseData.name,
                description: exerciseData.description,
                comments: exerciseData.comments,
                category: exerciseData.category,
                creator: profile.id,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    async update(exerciseId, exerciseData) {
        const { data, error } = await supabase
            .from('exercise_template')
            .update({
                exercise_name: exerciseData.name,
                description: exerciseData.description,
                comments: exerciseData.comments,
                category: exerciseData.category,
            })
            .eq('id', exerciseId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    async getAll() {
        const { data, error } = await supabase
            .from('exercise_template')
            .select(`
                *,
                exercise_template_has_tag (
                    tag:tag (
                        id,
                        name,
                        category
                    )
                )
            `)
            .order('exercise_name');

        if (error) throw new Error(error.message);

        return data?.map(exercise => ({
            ...exercise,
            tags: exercise.exercise_template_has_tag?.map(item => item.tag).filter(Boolean) || [],
        })) || [];
    },

    async getById(exerciseId) {
        const { data, error } = await supabase
            .from('exercise_template')
            .select(`
                *,
                exercise_template_has_tag (
                    tag:tag (
                        id,
                        name,
                        category
                    )
                )
            `)
            .eq('id', exerciseId)
            .single();

        if (error) throw new Error(error.message);

        return {
            ...data,
            tags: data.exercise_template_has_tag?.map(item => item.tag).filter(Boolean) || [],
        };
    },

    async search(filters = {}) {
        let query = supabase
            .from('exercise_template')
            .select(`
                *,
                exercise_template_has_tag (
                    tag:tag (
                        id,
                        name,
                        category
                    )
                )
            `)
            .order('exercise_name');

        if (filters.text) {
            query = query.or(`exercise_name.ilike.%${filters.text}%,description.ilike.%${filters.text}%`);
        }

        if (filters.category) {
            query = query.eq('category', filters.category);
        }

        if (filters.tags && filters.tags.length > 0) {
            query = query.in('exercise_template_has_tag.tag', filters.tags);
        }

        const { data, error } = await query;

        if (error) throw new Error(error.message);

        return data?.map(exercise => ({
            ...exercise,
            tags: exercise.exercise_template_has_tag?.map(item => item.tag).filter(Boolean) || [],
        })) || [];
    },

    async delete(exerciseId) {
        const { error } = await supabase
            .from('exercise_template')
            .delete()
            .eq('id', exerciseId);

        if (error) throw new Error(error.message);
    },
};

export const exerciseVideoService = {
    async upload(exerciseId, file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${exerciseId}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) throw new Error(uploadError.message);

        return fileName;
    },

    async getSignedUrl(exerciseId) {
        const extensions = ['mp4', 'webm', 'mov', 'avi'];
        
        for (const ext of extensions) {
            const fileName = `${exerciseId}.${ext}`;
            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .createSignedUrl(fileName, 3600);

            if (!error && data?.signedUrl) {
                return data.signedUrl;
            }
        }

        return null;
    },

    async delete(exerciseId) {
        const { data: files, error: listError } = await supabase.storage
            .from(BUCKET_NAME)
            .list('', {
                search: `${exerciseId}.`,
            });

        if (listError) throw new Error(listError.message);

        if (!files || files.length === 0) {
            return;
        }

        const fileName = files[0].name;
        const { error: deleteError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([fileName]);

        if (deleteError) throw new Error(deleteError.message);
    },
};

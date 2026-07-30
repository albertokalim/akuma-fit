import { supabase } from '../supabaseClient.js';
import { getCurrentUser } from '../utils/auth.js';

export const profileService = {
    async getByCurrentUser() {
        const user = await getCurrentUser();

        const { data: profile, error } = await supabase
            .from('profile')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return profile;
    },

    async getIdByCurrentUser() {
        const user = await getCurrentUser();

        const { data: profile, error } = await supabase
            .from('profile')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (error) throw new Error(error.message);
        if (!profile) throw new Error('No se ha encontrado tu perfil. Completa primero la valoración inicial.');

        return profile.id;
    },

    async getWithRole() {
        const user = await getCurrentUser();

        const { data: profile, error } = await supabase
            .from('profile')
            .select('id, role')
            .eq('user_id', user.id)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return profile;
    },

    async getOrCreate(userData) {
        const user = await getCurrentUser();

        const { data: existing, error: fetchError } = await supabase
            .from('profile')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

        if (fetchError) throw new Error(fetchError.message);
        if (existing) return existing.id;

        const { data: newProfile, error: insertError } = await supabase
            .from('profile')
            .insert({
                user_id: user.id,
                ...userData,
                role: 'client',
            })
            .select('id')
            .single();

        if (insertError) throw new Error(insertError.message);
        return newProfile.id;
    },
};

import { supabase } from '../supabaseClient.js';

export const coachReportService = {
    async getClients() {
        const { data, error } = await supabase
            .from('profile')
            .select('id, name, surname, user_id')
            .eq('role', 'client')
            .order('name');

        if (error) throw new Error(error.message);
        return data || [];
    },

    async getMeasurements(profileId) {
        const { data, error } = await supabase
            .from('measurement')
            .select('*')
            .eq('profile_id', profileId)
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);
        return data || [];
    },

    async getPhotos(profileId) {
        const { data, error } = await supabase
            .from('body_photo')
            .select('*')
            .eq('profile_id', profileId)
            .order('taken_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    }
};

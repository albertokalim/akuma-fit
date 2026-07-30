import { supabase } from '../supabaseClient.js';

export const coachCheckInService = {
    async getClients() {
        const { data, error } = await supabase
            .from('profile')
            .select('id, name, surname, user_id')
            .eq('role', 'client')
            .order('name');

        if (error) throw new Error(error.message);
        return data || [];
    },

    async getClientCheckIns(clientProfileId) {
        const { data, error } = await supabase
            .from('check_in')
            .select('*')
            .eq('profile_id', clientProfileId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    },
};

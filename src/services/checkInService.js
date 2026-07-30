import { supabase } from '../supabaseClient.js';
import { getCurrentProfile } from '../utils/auth.js';
import { normalizeNumericFields } from '../utils/data.js';

const NUMERIC_FIELDS = ['hunger_level', 'rest_quality', 'gym_performance', 'energy_level'];

export const checkInService = {
    async getAll() {
        const profile = await getCurrentProfile();

        const { data, error } = await supabase
            .from('check_in')
            .select('*')
            .eq('profile_id', profile.id)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    },

    async create(checkInData) {
        const profile = await getCurrentProfile();
        const payload = normalizeNumericFields(
            { ...checkInData, profile_id: profile.id },
            NUMERIC_FIELDS
        );

        const { error } = await supabase.from('check_in').insert(payload);
        if (error) throw new Error(error.message);
    },
};

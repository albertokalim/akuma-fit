import { supabase } from '../supabaseClient.js';
import { getCurrentProfile } from '../utils/auth.js';
import { normalizeNumericFields } from '../utils/data.js';

const NUMERIC_FIELDS = ['weight', 'chest', 'waist', 'hip'];

export const measurementService = {
    async getAll() {
        const profile = await getCurrentProfile();

        const { data, error } = await supabase
            .from('measurement')
            .select('*')
            .eq('profile_id', profile.id)
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);
        return data || [];
    },

    async create(measurementData) {
        const profile = await getCurrentProfile();
        const payload = normalizeNumericFields(
            { ...measurementData, profile_id: profile.id },
            NUMERIC_FIELDS
        );

        const { error } = await supabase.from('measurement').insert(payload);
        if (error) throw new Error(error.message);
    },

    async createWeightOnly(weight) {
        const profile = await getCurrentProfile();

        const payload = {
            profile_id: profile.id,
            weight: weight ? Number(weight) : null,
        };

        const { error } = await supabase.from('measurement').insert(payload);
        if (error) throw new Error(error.message);
    },
};

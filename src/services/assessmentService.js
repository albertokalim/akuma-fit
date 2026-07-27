import { supabase } from '../supabaseClient.js';
import { normalizeNumericFields } from '../utils/data.js';

const NUMERIC_FIELDS = ['height', 'motivation_level', 'current_stress_level', 'expected_adherence'];

export const assessmentService = {
    async exists(profileId) {
        const { data, error } = await supabase
            .from('initial_assessment')
            .select('id')
            .eq('profile_id', profileId)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return !!data;
    },

    async create(profileId, assessmentData) {
        const payload = normalizeNumericFields(
            { ...assessmentData, profile_id: profileId },
            NUMERIC_FIELDS
        );

        const { error } = await supabase.from('initial_assessment').insert(payload);
        if (error) throw new Error(error.message);
    },
};

import { supabase } from '../supabaseClient.js';
import { getCurrentProfile } from '../utils/auth.js';
import { normalizeNumericFields } from '../utils/data.js';

/**
 * Campos numéricos del check-in que se normalizan antes de insertar.
 */
const NUMERIC_FIELDS = ['hunger_level', 'rest_quality', 'gym_performance', 'energy_level'];

/**
 * Servicio de acceso a datos de los check-ins (`check_in`) del usuario actual.
 */
export const checkInService = {
    /**
     * Obtiene los check-ins del perfil actual, ordenados por fecha descendente.
     *
     * @returns {Promise<Array>} Lista de check-ins.
     */
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

    /**
     * Crea un check-in para el perfil actual, normalizando sus campos numéricos.
     *
     * @param {Object} checkInData - Datos del check-in.
     */
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

import { supabase } from '../supabaseClient.js';
import { normalizeNumericFields } from '../utils/data.js';

/**
 * Campos numéricos de la valoración inicial que se normalizan antes de
 * insertar en Supabase.
 */
const NUMERIC_FIELDS = ['height', 'motivation_level', 'current_stress_level', 'expected_adherence'];

/**
 * Servicio de acceso a datos de la valoración inicial (`initial_assessment`).
 */
export const assessmentService = {
    /**
     * Comprueba si un perfil ya tiene una valoración inicial.
     *
     * @param {number} profileId - Id del perfil.
     * @returns {Promise<boolean>} `true` si existe la valoración.
     */
    async exists(profileId) {
        const { data, error } = await supabase
            .from('initial_assessment')
            .select('id')
            .eq('profile_id', profileId)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return !!data;
    },

    /**
     * Obtiene la valoración inicial de un perfil.
     *
     * @param {number} profileId - Id del perfil.
     * @returns {Promise<Object|null>} Valoración o `null` si no existe.
     */
    async getByProfile(profileId) {
        const { data, error } = await supabase
            .from('initial_assessment')
            .select('*')
            .eq('profile_id', profileId)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return data || null;
    },

    /**
     * Crea la valoración inicial de un perfil, normalizando sus campos
     * numéricos.
     *
     * @param {number} profileId - Id del perfil.
     * @param {Object} assessmentData - Datos de la valoración.
     */
    async create(profileId, assessmentData) {
        const payload = normalizeNumericFields(
            { ...assessmentData, profile_id: profileId },
            NUMERIC_FIELDS
        );

        const { error } = await supabase.from('initial_assessment').insert(payload);
        if (error) throw new Error(error.message);
    },
};

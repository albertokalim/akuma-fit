import { supabase } from '../supabaseClient.js';
import { getCurrentUser } from '../utils/auth.js';

/**
 * Servicio de acceso a datos de los perfiles (`profile`).
 */
export const profileService = {
    /**
     * Obtiene el perfil del usuario autenticado actual.
     *
     * @returns {Promise<Object|null>} Perfil o `null` si no existe.
     */
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

    /**
     * Obtiene un perfil por id.
     *
     * @param {number} profileId - Id del perfil.
     * @returns {Promise<Object|null>} Perfil o `null`.
     */
    async getById(profileId) {
        const { data: profile, error } = await supabase
            .from('profile')
            .select('*')
            .eq('id', profileId)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return profile;
    },

    /**
     * Actualiza los datos de un perfil.
     *
     * @param {number} profileId - Id del perfil.
     * @param {Object} data - Campos a actualizar.
     * @returns {Promise<Object>} Perfil actualizado.
     */
    async update(profileId, data) {
        const { data: profile, error } = await supabase
            .from('profile')
            .update(data)
            .eq('id', profileId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return profile;
    },

    /**
     * Obtiene el id del perfil del usuario actual, lanzando error si no existe.
     *
     * @returns {Promise<number>} Id del perfil.
     */
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

    /**
     * Obtiene el id y el rol del perfil del usuario actual.
     *
     * @returns {Promise<Object|null>} Perfil con `id` y `role`, o `null`.
     */
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

    /**
     * Obtiene el perfil del usuario actual o lo crea si no existe (con rol
     * `client`), devolviendo su id.
     *
     * @param {Object} userData - Datos iniciales del perfil a crear.
     * @returns {Promise<number>} Id del perfil.
     */
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

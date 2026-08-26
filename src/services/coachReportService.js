import { supabase } from '../supabaseClient.js';

/**
 * Servicio de acceso a datos para los reportes del coach (clientes, medidas
 * y fotos).
 */
export const coachReportService = {
    /**
     * Obtiene la lista de clientes.
     *
     * @returns {Promise<Array>} Lista de clientes.
     */
    async getClients() {
        const { data, error } = await supabase
            .from('profile')
            .select('id, name, surname, user_id')
            .eq('role', 'client')
            .order('name');

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * Obtiene las medidas de un cliente, ordenadas por fecha ascendente.
     *
     * @param {number} profileId - Id del perfil del cliente.
     * @returns {Promise<Array>} Lista de medidas.
     */
    async getMeasurements(profileId) {
        const { data, error } = await supabase
            .from('measurement')
            .select('*')
            .eq('profile_id', profileId)
            .order('created_at', { ascending: true });

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * Obtiene las fotos corporales de un cliente, ordenadas por fecha descendente.
     *
     * @param {number} profileId - Id del perfil del cliente.
     * @returns {Promise<Array>} Lista de fotos.
     */
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

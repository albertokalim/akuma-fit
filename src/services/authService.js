import { supabase } from '../supabaseClient.js';

/**
 * Servicio de autenticación que envuelve `supabase.auth`.
 */
export const authService = {
    /**
     * Inicia sesión con email y contraseña.
     *
     * @param {string} email - Correo del usuario.
     * @param {string} password - Contraseña.
     * @returns {Promise<Object>} Datos de la sesión.
     */
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    /**
     * Registra un nuevo usuario con email y contraseña.
     *
     * @param {string} email - Correo del usuario.
     * @param {string} password - Contraseña.
     * @returns {Promise<Object>} Datos del registro.
     */
    async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data;
    },

    /** Cierra la sesión actual. */
    async signOut() {
        await supabase.auth.signOut();
    },

    /**
     * Obtiene el usuario autenticado actual.
     *
     * @returns {Promise<Object|null>} Usuario autenticado.
     */
    async getUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    /**
     * Actualiza los atributos del usuario autenticado.
     *
     * @param {Object} attributes - Atributos a actualizar.
     * @returns {Promise<Object>} Datos actualizados.
     */
    async updateUser(attributes) {
        const { data, error } = await supabase.auth.updateUser(attributes);
        if (error) throw error;
        return data;
    },
};

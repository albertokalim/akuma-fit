import { supabase } from '../supabaseClient.js';

/**
 * Obtiene el usuario autenticado actual desde Supabase. Lanza un error si no
 * hay sesión iniciada.
 *
 * @returns {Promise<Object>} Usuario autenticado.
 * @throws {Error} Si no hay usuario autenticado.
 */
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error('Debes iniciar sesión.');
    }

    return user;
};

/**
 * Obtiene el perfil (`profile`) asociado al usuario autenticado. Lanza un
 * error si no hay sesión o si el perfil no existe (p. ej. antes de completar
 * la valoración inicial).
 *
 * @returns {Promise<Object>} Perfil del usuario (`id`).
 * @throws {Error} Si no hay sesión o el perfil no se encuentra.
 */
export const getCurrentProfile = async () => {
    const user = await getCurrentUser();

    const { data: profile, error } = await supabase
        .from('profile')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {
        throw new Error(`No se pudo comprobar el perfil: ${error.message}`);
    }

    if (!profile) {
        throw new Error('No se ha encontrado tu perfil. Completa primero la valoración inicial.');
    }

    return profile;
};

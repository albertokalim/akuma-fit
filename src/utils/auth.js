import { supabase } from '../supabaseClient.js';

export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        throw new Error('Debes iniciar sesión.');
    }

    return user;
};

export const getCurrentProfile = async () => {
    const user = await getCurrentUser();

    const { data: profile, error } = await supabase
        .from('profile')
        .select('id')
        .eq('user', user.id)
        .maybeSingle();

    if (error) {
        throw new Error(`No se pudo comprobar el perfil: ${error.message}`);
    }

    if (!profile) {
        throw new Error('No se ha encontrado tu perfil. Completa primero la valoración inicial.');
    }

    return profile;
};

import { supabase } from '../supabaseClient.js';

/**
 * Servicio de acceso a datos del avatar de perfil: subida, listado y borrado
 * de archivos en el bucket `avatars`, y gestión del registro `avatar`.
 */
export const avatarService = {
    /**
     * Obtiene el `avatar_uid` del avatar de un perfil.
     *
     * @param {number} profileId - Id del perfil.
     * @returns {Promise<string|null>} Uid del avatar o `null`.
     */
    async getAvatarUid(profileId) {
        const { data } = await supabase
            .from('avatar')
            .select('avatar_uid')
            .eq('profile_id', profileId)
            .maybeSingle();

        return data?.avatar_uid;
    },

    /**
     * Genera una URL firmada para un archivo del bucket de avatares.
     *
     * @param {number} profileId - Id del perfil (carpeta).
     * @param {string} fileName - Nombre del archivo.
     * @returns {Promise<string>} URL firmada.
     */
    async getSignedUrl(profileId, fileName) {
        const { data, error } = await supabase.storage
            .from('avatars')
            .createSignedUrl(`${profileId}/${fileName}`, 3600);

        if (error) throw error;
        return data?.signedUrl;
    },

    /**
     * Lista los archivos del bucket de avatares de un perfil.
     *
     * @param {number} profileId - Id del perfil.
     * @returns {Promise<Array>} Lista de archivos.
     */
    async listFiles(profileId) {
        const { data } = await supabase.storage.from('avatars').list(String(profileId));
        return data || [];
    },

    /**
     * Sube un archivo de avatar para un perfil.
     *
     * @param {number} profileId - Id del perfil.
     * @param {string} fileName - Nombre del archivo.
     * @param {File} file - Archivo a subir.
     */
    async upload(profileId, fileName, file) {
        const { error } = await supabase.storage
            .from('avatars')
            .upload(`${profileId}/${fileName}`, file);

        if (error) throw error;
    },

    /**
     * Elimina un archivo de avatar del bucket.
     *
     * @param {number} profileId - Id del perfil.
     * @param {string} fileName - Nombre del archivo.
     */
    async removeFile(profileId, fileName) {
        await supabase.storage.from('avatars').remove([`${profileId}/${fileName}`]);
    },

    /**
     * Registra el `avatar_uid` del avatar de un perfil.
     *
     * @param {number} profileId - Id del perfil.
     * @param {string} avatarUid - Uid del avatar.
     */
    async setAvatarUid(profileId, avatarUid) {
        const { error } = await supabase
            .from('avatar')
            .insert({ profile_id: profileId, avatar_uid: avatarUid });

        if (error) throw error;
    },

    /**
     * Elimina el registro de avatar de un perfil.
     *
     * @param {number} profileId - Id del perfil.
     */
    async deleteAvatarRecord(profileId) {
        await supabase.from('avatar').delete().eq('profile_id', profileId);
    },
};

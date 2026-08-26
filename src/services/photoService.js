import { supabase } from '../supabaseClient.js';

const BUCKET_NAME = 'body-photos';

/**
 * Servicio de acceso a datos de las fotos corporales (`body_photo`) y su
 * almacenamiento en el bucket `body-photos`.
 */
export const photoService = {
    /**
     * Sube una foto y crea su registro, devolviendo la fila creada.
     *
     * @param {number} profileId - Id del perfil.
     * @param {string} date - Fecha de la foto (YYYY-MM-DD).
     * @param {string} position - Posición de la foto.
     * @param {File} file - Archivo de imagen.
     * @returns {Promise<Object>} Registro de foto creado.
     */
    async upload(profileId, date, position, file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${profileId}/${date}/${position}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) throw new Error(uploadError.message);

        const { data, error: insertError } = await supabase
            .from('body_photo')
            .insert({
                profile_id: profileId,
                taken_at: date,
                position: position,
                storage_path: fileName
            })
            .select()
            .single();

        if (insertError) throw new Error(insertError.message);
        return data;
    },

    /**
     * Obtiene todas las fotos de un perfil, ordenadas por fecha descendente.
     *
     * @param {number} profileId - Id del perfil.
     * @returns {Promise<Array>} Lista de fotos.
     */
    async getByProfile(profileId) {
        const { data, error } = await supabase
            .from('body_photo')
            .select('*')
            .eq('profile_id', profileId)
            .order('taken_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * Obtiene las fotos de un perfil tomadas en una fecha concreta.
     *
     * @param {number} profileId - Id del perfil.
     * @param {string} date - Fecha (YYYY-MM-DD).
     * @returns {Promise<Array>} Lista de fotos.
     */
    async getByDate(profileId, date) {
        const { data, error } = await supabase
            .from('body_photo')
            .select('*')
            .eq('profile_id', profileId)
            .eq('taken_at', date);

        if (error) throw new Error(error.message);
        return data || [];
    },

    /**
     * Elimina una foto: borra el archivo del bucket y su registro.
     *
     * @param {number} photoId - Id de la foto.
     */
    async delete(photoId) {
        const { data: photo, error: fetchError } = await supabase
            .from('body_photo')
            .select('storage_path')
            .eq('id', photoId)
            .single();

        if (fetchError) throw new Error(fetchError.message);

        const { error: storageError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([photo.storage_path]);

        if (storageError) throw new Error(storageError.message);

        const { error: deleteError } = await supabase
            .from('body_photo')
            .delete()
            .eq('id', photoId);

        if (deleteError) throw new Error(deleteError.message);
    },

    /**
     * Genera una URL firmada para una ruta de almacenamiento.
     *
     * @param {string} storagePath - Ruta del archivo.
     * @returns {Promise<string>} URL firmada.
     */
    async getSignedUrl(storagePath) {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(storagePath, 3600);

        if (error) throw new Error(error.message);
        return data.signedUrl;
    },

    /**
     * Genera URLs firmadas para varias rutas, devolviendo un mapa ruta -> URL
     * (o `null` si esa ruta falló).
     *
     * @param {string[]} storagePaths - Rutas de los archivos.
     * @returns {Promise<Object<string, string|null>>} Mapa de URLs.
     */
    async getSignedUrls(storagePaths) {
        if (!storagePaths || storagePaths.length === 0) return {};

        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrls(storagePaths, 3600);

        if (error) throw new Error(error.message);

        return (data || []).reduce((acc, item) => {
            acc[item.path] = item.error ? null : item.signedUrl;
            return acc;
        }, {});
    }
};

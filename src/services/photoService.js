import { supabase } from '../supabaseClient.js';

const BUCKET_NAME = 'body-photos';

export const photoService = {
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

    async getByProfile(profileId) {
        const { data, error } = await supabase
            .from('body_photo')
            .select('*')
            .eq('profile_id', profileId)
            .order('taken_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    },

    async getByDate(profileId, date) {
        const { data, error } = await supabase
            .from('body_photo')
            .select('*')
            .eq('profile_id', profileId)
            .eq('taken_at', date);

        if (error) throw new Error(error.message);
        return data || [];
    },

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

    async getSignedUrl(storagePath) {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(storagePath, 3600);

        if (error) throw new Error(error.message);
        return data.signedUrl;
    }
};

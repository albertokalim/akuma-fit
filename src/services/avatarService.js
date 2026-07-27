import { supabase } from '../supabaseClient.js';

export const avatarService = {
    async getAvatarUid(userId) {
        const { data } = await supabase
            .from('avatar')
            .select('avatar_uid')
            .eq('user_uid', userId)
            .maybeSingle();

        return data?.avatar_uid;
    },

    async getSignedUrl(userId, fileName) {
        const { data, error } = await supabase.storage
            .from('avatars')
            .createSignedUrl(`${userId}/${fileName}`, 3600);

        if (error) throw error;
        return data?.signedUrl;
    },

    async listFiles(userId) {
        const { data } = await supabase.storage.from('avatars').list(userId);
        return data || [];
    },

    async upload(userId, fileName, file) {
        const { error } = await supabase.storage
            .from('avatars')
            .upload(`${userId}/${fileName}`, file);

        if (error) throw error;
    },

    async removeFile(userId, fileName) {
        await supabase.storage.from('avatars').remove([`${userId}/${fileName}`]);
    },

    async setAvatarUid(userId, avatarUid) {
        const { error } = await supabase
            .from('avatar')
            .insert({ user_uid: userId, avatar_uid: avatarUid });

        if (error) throw error;
    },

    async deleteAvatarRecord(userId) {
        await supabase.from('avatar').delete().eq('user_uid', userId);
    },
};

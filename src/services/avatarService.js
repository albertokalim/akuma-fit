import { supabase } from '../supabaseClient.js';

export const avatarService = {
    async getAvatarUid(profileId) {
        const { data } = await supabase
            .from('avatar')
            .select('avatar_uid')
            .eq('profile_id', profileId)
            .maybeSingle();

        return data?.avatar_uid;
    },

    async getSignedUrl(profileId, fileName) {
        const { data, error } = await supabase.storage
            .from('avatars')
            .createSignedUrl(`${profileId}/${fileName}`, 3600);

        if (error) throw error;
        return data?.signedUrl;
    },

    async listFiles(profileId) {
        const { data } = await supabase.storage.from('avatars').list(String(profileId));
        return data || [];
    },

    async upload(profileId, fileName, file) {
        const { error } = await supabase.storage
            .from('avatars')
            .upload(`${profileId}/${fileName}`, file);

        if (error) throw error;
    },

    async removeFile(profileId, fileName) {
        await supabase.storage.from('avatars').remove([`${profileId}/${fileName}`]);
    },

    async setAvatarUid(profileId, avatarUid) {
        const { error } = await supabase
            .from('avatar')
            .insert({ profile_id: profileId, avatar_uid: avatarUid });

        if (error) throw error;
    },

    async deleteAvatarRecord(profileId) {
        await supabase.from('avatar').delete().eq('profile_id', profileId);
    },
};

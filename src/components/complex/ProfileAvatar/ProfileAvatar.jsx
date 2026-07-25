import { useState, useRef } from 'react';
import Avatar from '../../primitives/Avatar/Avatar.jsx';
import { FiCamera } from 'react-icons/fi';
import { supabase } from '../../../supabaseClient.js';
import { resizeImage } from '../../../utils/image.js';
import './ProfileAvatar.css';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function ProfileAvatar({ userId, size = 'large' }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const fileInputRef = useRef(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !userId) return;

        setError(null);

        if (!file.type.startsWith('image/')) {
            setError('El archivo debe ser una imagen');
            e.target.value = '';
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setError('La imagen debe pesar menos de 5MB');
            e.target.value = '';
            return;
        }

        setUploading(true);

        let fileToUpload;
        try {
            fileToUpload = await resizeImage(file, 200);
        } catch {
            setError('Error al procesar la imagen');
            setUploading(false);
            e.target.value = '';
            return;
        }

        const newAvatarUid = crypto.randomUUID();
        const fileExt = fileToUpload.name.split('.').pop();

        try {
            const { data: existing } = await supabase
                .from('avatar')
                .select('avatar_uid')
                .eq('user_uid', userId)
                .maybeSingle();

            if (existing?.avatar_uid) {
                const { data: files } = await supabase.storage
                    .from('avatars')
                    .list(userId);

                if (files) {
                    const oldFile = files.find(f => f.name.startsWith(existing.avatar_uid));
                    if (oldFile) {
                        await supabase.storage
                            .from('avatars')
                            .remove([`${userId}/${oldFile.name}`]);
                    }
                }

                await supabase
                    .from('avatar')
                    .delete()
                    .eq('user_uid', userId);
            }

            const { error: insertError } = await supabase
                .from('avatar')
                .insert({ user_uid: userId, avatar_uid: newAvatarUid });

            if (insertError) throw insertError;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(`${userId}/${newAvatarUid}.${fileExt}`, fileToUpload);

            if (uploadError) throw uploadError;

            setRefreshKey(prev => prev + 1);
        } catch {
            setError('Error al subir la imagen');
        }

        setUploading(false);
        e.target.value = '';
    };

    return (
        <div className="profile-avatar-wrapper" onClick={handleAvatarClick}>
            <Avatar
                key={refreshKey}
                userId={userId}
                alt="Perfil"
                size={size}
            />
            <div className="profile-avatar-overlay">
                {uploading ? (
                    <span className="profile-avatar-uploading">...</span>
                ) : (
                    <FiCamera size={20} />
                )}
            </div>
            {error && <div className="profile-avatar-error">{error}</div>}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="profile-avatar-input"
            />
        </div>
    );
}

export default ProfileAvatar;

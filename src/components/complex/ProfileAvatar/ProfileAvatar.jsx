import { useState, useRef } from 'react';
import Avatar from '../../primitives/Avatar/Avatar.jsx';
import { FiCamera } from 'react-icons/fi';
import { supabase } from '../../../supabaseClient.js';
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

        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (!uploadError) {
            setRefreshKey(prev => prev + 1);
        } else {
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

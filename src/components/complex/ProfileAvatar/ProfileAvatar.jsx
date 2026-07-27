import { useState, useRef } from 'react';
import Avatar from '../../primitives/Avatar/Avatar.jsx';
import { FiCamera } from 'react-icons/fi';
import { avatarService } from '../../../services/avatarService.js';
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
            const existingUid = await avatarService.getAvatarUid(userId);

            if (existingUid) {
                const files = await avatarService.listFiles(userId);
                const oldFile = files.find(f => f.name.startsWith(existingUid));
                if (oldFile) {
                    await avatarService.removeFile(userId, oldFile.name);
                }
                await avatarService.deleteAvatarRecord(userId);
            }

            await avatarService.setAvatarUid(userId, newAvatarUid);
            await avatarService.upload(userId, `${newAvatarUid}.${fileExt}`, fileToUpload);

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

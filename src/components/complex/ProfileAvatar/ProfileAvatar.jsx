import { useState, useRef } from 'react';
import Avatar from '../../primitives/Avatar/Avatar.jsx';
import { FiCamera } from 'react-icons/fi';
import { avatarService } from '../../../services/avatarService.js';
import { resizeImage, mimeToExtension } from '../../../utils/image.js';


/** Tamaño máximo permitido de la imagen de perfil (5 MB). */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Avatar de perfil editable: al hacer clic abre el selector de archivos para
 * subir o reemplazar la foto, redimensionándola y gestionando el borrado de
 * la anterior.
 *
 * @param {Object} props - Props del componente.
 * @param {number} props.profileId - Id del perfil.
 * @param {'small'|'medium'|'large'} [props.size='large'] - Tamaño del avatar.
 */
function ProfileAvatar({ profileId, size = 'large' }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const fileInputRef = useRef(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !profileId) return;

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
        const fileExt = mimeToExtension(fileToUpload.type);

        try {
            const existingUid = await avatarService.getAvatarUid(profileId);

            if (existingUid) {
                const files = await avatarService.listFiles(profileId);
                const oldFile = files.find(f => f.name.startsWith(existingUid));
                if (oldFile) {
                    await avatarService.removeFile(profileId, oldFile.name);
                }
                await avatarService.deleteAvatarRecord(profileId);
            }

            await avatarService.setAvatarUid(profileId, newAvatarUid);
            await avatarService.upload(profileId, `${newAvatarUid}.${fileExt}`, fileToUpload);

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
                profileId={profileId}
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

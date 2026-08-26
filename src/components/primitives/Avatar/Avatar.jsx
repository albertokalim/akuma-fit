import { useState, useEffect, useMemo } from 'react';
import { FiUser } from 'react-icons/fi';
import { avatarService } from '../../../services/avatarService.js';


/**
 * Avatar de perfil. Si no se pasa `src`, intenta resolver la URL firmada del
 * avatar del perfil desde el servicio; si no hay, muestra un placeholder con
 * un icono de usuario.
 *
 * @param {Object} props - Props del componente.
 * @param {string} [props.src] - URL directa del avatar (opcional).
 * @param {number} [props.profileId] - Id del perfil para resolver el avatar.
 * @param {string} [props.avatarUid] - Uid del avatar (evita consultarlo).
 * @param {string} [props.alt] - Texto alternativo de la imagen.
 * @param {'small'|'medium'|'large'} [props.size='medium'] - Tamaño del avatar.
 */
function Avatar({ src, profileId, avatarUid: avatarUidProp, alt, size = 'medium' }) {
    const [fetchedUrl, setFetchedUrl] = useState(null);

    useEffect(() => {
        if (src || !profileId) return;

        const fetchAvatar = async () => {
            try {
                const [avatarUid, files] = await Promise.all([
                    avatarUidProp ? Promise.resolve(avatarUidProp) : avatarService.getAvatarUid(profileId),
                    avatarService.listFiles(profileId),
                ]);

                if (!avatarUid) return;

                const file = files.find(f => f.name.startsWith(avatarUid));
                if (file) {
                    const signedUrl = await avatarService.getSignedUrl(profileId, file.name);
                    if (signedUrl) {
                        setFetchedUrl(signedUrl);
                    }
                }
            } catch {
            }
        };

        fetchAvatar();
    }, [src, profileId, avatarUidProp]);

    const avatarUrl = useMemo(() => src || fetchedUrl, [src, fetchedUrl]);

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={alt}
                className={`avatar avatar-${size}`}
            />
        );
    }

    return (
        <div className={`avatar avatar-placeholder avatar-${size}`}>
            <FiUser size={size === 'large' ? 40 : size === 'medium' ? 24 : 16} />
        </div>
    );
}

export default Avatar;

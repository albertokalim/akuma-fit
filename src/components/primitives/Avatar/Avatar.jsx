import { useState, useEffect, useMemo } from 'react';
import { FiUser } from 'react-icons/fi';
import { avatarService } from '../../../services/avatarService.js';


function Avatar({ src, profileId, avatarUid: avatarUidProp, alt, size = 'medium' }) {
    const [fetchedUrl, setFetchedUrl] = useState(null);

    useEffect(() => {
        if (src || !profileId) return;

        const fetchAvatar = async () => {
            try {
                // `listFiles` no depende del avatar_uid, así que se puede lanzar
                // en paralelo con su búsqueda en vez de esperar secuencialmente.
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
                // Silently fail - avatar is optional
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

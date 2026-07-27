import { useState, useEffect } from 'react';
import { FiUser } from 'react-icons/fi';
import { avatarService } from '../../../services/avatarService.js';
import './Avatar.css';

function Avatar({ src, userId, avatarUid: avatarUidProp, alt, size = 'medium' }) {
    const [avatarUrl, setAvatarUrl] = useState(src || null);

    useEffect(() => {
        if (src) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAvatarUrl(src);
            return;
        }

        if (!userId) return;

        const fetchAvatar = async () => {
            try {
                let avatarUid = avatarUidProp;

                if (!avatarUid) {
                    avatarUid = await avatarService.getAvatarUid(userId);
                }

                if (!avatarUid) return;

                const files = await avatarService.listFiles(userId);
                const file = files.find(f => f.name.startsWith(avatarUid));
                if (file) {
                    const signedUrl = await avatarService.getSignedUrl(userId, file.name);
                    if (signedUrl) {
                        setAvatarUrl(signedUrl);
                    }
                }
            } catch {
                // Silently fail - avatar is optional
            }
        };

        fetchAvatar();
    }, [src, userId, avatarUidProp]);

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

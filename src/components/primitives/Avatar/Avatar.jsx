import { useState, useEffect } from 'react';
import { FiUser } from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
import './Avatar.css';

function Avatar({ src, userId, alt, size = 'medium' }) {
    const [avatarUrl, setAvatarUrl] = useState(src || null);

    useEffect(() => {
        if (src) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAvatarUrl(src);
            return;
        }

        if (!userId) return;

        const fetchAvatar = async () => {
            const { data } = await supabase.storage
                .from('avatars')
                .list(userId);

            if (data && data.length > 0) {
                const file = data[0];
                const { data: urlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(`${userId}/${file.name}`);
                setAvatarUrl(urlData.publicUrl);
            }
        };

        fetchAvatar();
    }, [src, userId]);

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

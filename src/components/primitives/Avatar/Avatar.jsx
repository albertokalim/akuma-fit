import { useState, useEffect } from 'react';
import { FiUser } from 'react-icons/fi';
import { supabase } from '../../../supabaseClient';
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
            let avatarUid = avatarUidProp;

            if (!avatarUid) {
                const { data } = await supabase
                    .from('avatar')
                    .select('avatar_uid')
                    .eq('user_uid', userId)
                    .maybeSingle();

                avatarUid = data?.avatar_uid;
            }

            if (!avatarUid) return;

            const { data } = await supabase.storage
                .from('avatars')
                .list(userId);

            if (data) {
                const file = data.find(f => f.name.startsWith(avatarUid));
                if (file) {
                    const { data: urlData, error } = await supabase.storage
                        .from('avatars')
                        .createSignedUrl(`${userId}/${file.name}`, 3600);
                    
                    if (!error && urlData?.signedUrl) {
                        setAvatarUrl(urlData.signedUrl);
                    }
                }
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

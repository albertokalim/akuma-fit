import { useAuth } from '../../context/useAuth.js';
import ProfileView from './ProfileView.jsx';

/**
 * Ruta de perfil: envuelve `ProfileView` pasándole el id del perfil actual.
 */
function ProfileFormRoute() {
    const { profileId } = useAuth();

    return (
        <ProfileView
            profileId={profileId}
        />
    );
}

export default ProfileFormRoute;

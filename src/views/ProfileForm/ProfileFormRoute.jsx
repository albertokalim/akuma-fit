import { useAuth } from '../../context/useAuth.js';
import ProfileView from './ProfileView.jsx';

 
function ProfileFormRoute() {
    const { profileId } = useAuth();

    return (
        <ProfileView
            profileId={profileId}
        />
    );
}

export default ProfileFormRoute;

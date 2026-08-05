import { useAuth } from '../../context/useAuth.js';
import ProfileForm from './ProfileForm.jsx';

/** Ruta "/app/profile": conecta ProfileForm con el AuthContext. */
function ProfileFormRoute() {
    const { user, profileId } = useAuth();

    const handleSave = async (formData) => {
        // TODO: Implementar guardado en Supabase
        console.log('Guardar perfil:', formData);
    };

    return (
        <ProfileForm
            profileId={profileId}
            initialData={{ email: user }}
            onSave={handleSave}
        />
    );
}

export default ProfileFormRoute;

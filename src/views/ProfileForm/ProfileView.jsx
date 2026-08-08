import { useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import ProfileAvatar from '../../components/complex/ProfileAvatar/ProfileAvatar.jsx';
import { profileService } from '../../services/profileService.js';
import { authService } from '../../services/authService.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import ProfileForm from './ProfileForm.jsx';

function ProfileView({ profileId }) {
    const [isEditing, setIsEditing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const loadProfile = async () => {
        const [profile, user] = await Promise.all([
            profileService.getById(profileId),
            authService.getUser(),
        ]);
        return { ...profile, email: user.email };
    };

    const { data: profile, loading, error } = useAsyncData(loadProfile, [profileId, refreshKey]);

    const handleSave = async (formData) => {
        const { email, ...profileData } = formData;
        if (email) {
            await authService.updateUser({ email });
        }
        await profileService.update(profileId, profileData);
        setIsEditing(false);
        setRefreshKey((prev) => prev + 1);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <ProfileForm
                initialData={profile}
                onSave={handleSave}
                onCancel={handleCancel}
            />
        );
    }

    if (loading) {
        return <div className="loading-state">Cargando perfil...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    if (!profile) {
        return <div className="empty-state">No se encontró el perfil</div>;
    }

    return (
        <div className="profile-view">
            <div className="profile-view-header">
                <h1 className="profile-view-title">Mi perfil</h1>
                <button onClick={() => setIsEditing(true)} className="btn-outline">
                    <FiEdit2 size={16} />
                    <span>Editar perfil</span>
                </button>
            </div>

            <div className="profile-view-content">
                <div className="profile-view-avatar-section">
                    <ProfileAvatar profileId={profileId} size="large" />
                </div>

                <div className="profile-view-info">
                    <div className="profile-view-section">
                        <h2 className="profile-view-section-title">Información personal</h2>
                        <div className="profile-view-field">
                            <span className="profile-view-label">Nombre</span>
                            <span className="profile-view-value">{profile.name || 'No especificado'}</span>
                        </div>
                        <div className="profile-view-field">
                            <span className="profile-view-label">Apellidos</span>
                            <span className="profile-view-value">{profile.surname || 'No especificado'}</span>
                        </div>
                        {profile.birthdate && (
                            <div className="profile-view-field">
                                <span className="profile-view-label">Fecha de nacimiento</span>
                                <span className="profile-view-value">
                                    {new Date(profile.birthdate).toLocaleDateString('es-ES')}
                                </span>
                            </div>
                        )}
                        {profile.gender && (
                            <div className="profile-view-field">
                                <span className="profile-view-label">Género</span>
                                <span className="profile-view-value">{profile.gender}</span>
                            </div>
                        )}
                    </div>

                    <div className="profile-view-section">
                        <h2 className="profile-view-section-title">Contacto</h2>
                        {profile.email && (
                            <div className="profile-view-field">
                                <span className="profile-view-label">Email</span>
                                <span className="profile-view-value">{profile.email}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileView;

import { useState } from 'react';
import BodyPhotoCapture from '../../components/complex/BodyPhotoCapture/BodyPhotoCapture.jsx';
import Button from '../../components/primitives/Button/Button.jsx';
import './BodyPhotos.css';

function BodyPhotos({ onBack }) {
    const [photos, setPhotos] = useState({});
    const [saved, setSaved] = useState(false);

    const handlePhotosChange = (newPhotos) => {
        setPhotos(newPhotos);
        setSaved(false);
    };

    const handleSave = () => {
        // TODO: Guardar las fotos en Supabase
        console.log('Guardando fotos:', photos);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="body-photos">
            <div className="body-photos-header">
                <h1 className="body-photos-title">Fotos Corporales</h1>
                <p className="body-photos-description">
                    Registra tu progreso visual con fotos desde diferentes ángulos.
                </p>
            </div>

            <BodyPhotoCapture onPhotosChange={handlePhotosChange} />

            <div className="body-photos-actions">
                {saved && (
                    <div className="success-message">
                        ¡Fotos guardadas correctamente!
                    </div>
                )}
                
                <div className="body-photos-buttons">
                    {onBack && (
                        <Button
                            text="Volver"
                            onClick={onBack}
                            className="back-button"
                        />
                    )}
                    <Button
                        text="Guardar Fotos"
                        onClick={handleSave}
                        disabled={Object.keys(photos).length === 0}
                        className="save-photos-button"
                    />
                </div>
            </div>
        </div>
    );
}

export default BodyPhotos;

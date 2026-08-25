import { useNavigate } from 'react-router-dom';
import BodyPhotos from '../BodyPhotos/BodyPhotos.jsx';

/**
 * Ruta de fotos corporales desde el progreso, envuelve `BodyPhotos`.
 */
function ProgressBodyPhotos() {
    const navigate = useNavigate();

    return <BodyPhotos onBack={() => navigate('/app/progress')} />;
}

export default ProgressBodyPhotos;

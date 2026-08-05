import { useNavigate } from 'react-router-dom';
import BodyPhotos from '../BodyPhotos/BodyPhotos.jsx';

/** Ruta "/app/progress/photos": envuelve la captura de fotos corporales. */
function ProgressBodyPhotos() {
    const navigate = useNavigate();

    return <BodyPhotos onBack={() => navigate('/app/progress')} />;
}

export default ProgressBodyPhotos;

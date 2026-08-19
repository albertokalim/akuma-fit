import { useNavigate } from 'react-router-dom';
import BodyPhotos from '../BodyPhotos/BodyPhotos.jsx';

 
function ProgressBodyPhotos() {
    const navigate = useNavigate();

    return <BodyPhotos onBack={() => navigate('/app/progress')} />;
}

export default ProgressBodyPhotos;

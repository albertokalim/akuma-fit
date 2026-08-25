import { useNavigate } from 'react-router-dom';
import CheckInForm from '../CheckInForm/CheckInForm.jsx';

/**
 * Ruta para crear un nuevo check-in, envuelve el formulario y navega de
 * vuelta al listado al completar.
 */
function NewCheckIn() {
    const navigate = useNavigate();
    const goBack = () => navigate('/app/checkin');

    return <CheckInForm onComplete={goBack} onCancel={goBack} />;
}

export default NewCheckIn;

import { useNavigate } from 'react-router-dom';
import CheckInForm from '../CheckInForm/CheckInForm.jsx';

/** Ruta "/app/checkin/new": envuelve el formulario y vuelve al listado al terminar. */
function NewCheckIn() {
    const navigate = useNavigate();
    const goBack = () => navigate('/app/checkin');

    return <CheckInForm onComplete={goBack} onCancel={goBack} />;
}

export default NewCheckIn;

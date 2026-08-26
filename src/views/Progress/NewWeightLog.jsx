import { useNavigate } from 'react-router-dom';
import WeightLogForm from '../WeightLogForm/WeightLogForm.jsx';

/**
 * Ruta para registrar un nuevo peso, envuelve el formulario y navega de
 * vuelta al progreso al completar.
 */
function NewWeightLog() {
    const navigate = useNavigate();
    const goBack = () => navigate('/app/progress');

    return <WeightLogForm onComplete={goBack} onCancel={goBack} />;
}

export default NewWeightLog;

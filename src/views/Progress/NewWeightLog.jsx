import { useNavigate } from 'react-router-dom';
import WeightLogForm from '../WeightLogForm/WeightLogForm.jsx';

/** Ruta "/app/progress/weight": envuelve el formulario y vuelve al progreso al terminar. */
function NewWeightLog() {
    const navigate = useNavigate();
    const goBack = () => navigate('/app/progress');

    return <WeightLogForm onComplete={goBack} onCancel={goBack} />;
}

export default NewWeightLog;

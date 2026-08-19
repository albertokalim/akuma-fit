import { useNavigate } from 'react-router-dom';
import WeightLogForm from '../WeightLogForm/WeightLogForm.jsx';

 
function NewWeightLog() {
    const navigate = useNavigate();
    const goBack = () => navigate('/app/progress');

    return <WeightLogForm onComplete={goBack} onCancel={goBack} />;
}

export default NewWeightLog;

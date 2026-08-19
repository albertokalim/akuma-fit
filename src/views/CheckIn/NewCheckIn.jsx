import { useNavigate } from 'react-router-dom';
import CheckInForm from '../CheckInForm/CheckInForm.jsx';

 
function NewCheckIn() {
    const navigate = useNavigate();
    const goBack = () => navigate('/app/checkin');

    return <CheckInForm onComplete={goBack} onCancel={goBack} />;
}

export default NewCheckIn;

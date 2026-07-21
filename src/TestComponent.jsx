import { useState } from 'react';
import Home from './views/Home/Home.jsx';
import InitialAssessment from "./views/InitialAssessment/InitialAssessment.jsx";
import CheckIn from "./views/CheckIn/CheckIn.jsx";
import WeightLog from "./views/WeightLog/WeightLog.jsx";
import Register from "./views/Register/Register.jsx";

function TestComponent() {
    const [userRole, setUserRole] = useState('coach');

    const handleLogout = () => {
        alert('Logout clicked!');
    };

    const toggleRole = () => {
        setUserRole(userRole === 'coach' ? 'client' : 'coach');
    };

    return (
        <>
            <Register />
        </>
    );
}

export default TestComponent;



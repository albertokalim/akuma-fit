import { useState } from 'react';
import Home from './views/Home/Home.jsx';
import InitialAssessment from "./views/InitialAssessment/InitialAssessment.jsx";

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
            <InitialAssessment />
        </>
    );
}

export default TestComponent;



import { useState } from 'react';
import Home from './views/Home/Home.jsx';

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
            <div style={{ 
                position: 'fixed', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: 1000,
                backgroundColor: '#fff',
                padding: '20px 40px',
                borderRadius: '8px',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)'
            }}>
                <button onClick={toggleRole} style={{ 
                    padding: '12px 24px', 
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    transition: 'background-color 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                >
                    Cambiar rol: {userRole === 'coach' ? 'Coach' : 'Client'}
                </button>
            </div>
            <Home email="test@example.com" onLogout={handleLogout} userRole={userRole} />
        </>
    );
}

export default TestComponent;



import React from 'react';
import Button from './components/Button.jsx';
import './Dashboard.css';

function Dashboard({ email, onLogout }) {
    return (
        <div className="dashboard-container">
            <h2>Bienvenido</h2>
            <div className="user-info">
                <p>Email: <strong>{email}</strong></p>
            </div>
            <Button text="Cerrar Sesión" onClick={onLogout} />
        </div>
    );
}

export default Dashboard;

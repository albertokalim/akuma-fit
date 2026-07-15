import { useState, useMemo } from 'react';
import Header from '../../components/complex/Header/Header.jsx';
import Sidebar from '../../components/complex/Sidebar/Sidebar.jsx';
import Dashboard from '../Dashboard/Dashboard.jsx';
import menuConfig from '../../menuConfig.json';
import './Home.css';

function Home({ email, onLogout, userRole = 'coach' }) {
    const [activeMenuId, setActiveMenuId] = useState('dashboard');

    const componentMap = {
        'dashboard': Dashboard,
        'clients': () => <div className="placeholder-component"><h2>Clientes Component</h2></div>,
        'exercises': () => <div className="placeholder-component"><h2>Ejercicios Component</h2></div>,
        'alimentos': () => <div className="placeholder-component"><h2>Alimentos Component</h2></div>,
        'plans': () => <div className="placeholder-component"><h2>Planes Component</h2></div>,
        'reportes': () => <div className="placeholder-component"><h2>Reportes Component</h2></div>,
        'my-plan': () => <div className="placeholder-component"><h2>Mi Plan Component</h2></div>,
        'nutrition': () => <div className="placeholder-component"><h2>Nutrición Component</h2></div>,
        'progress': () => <div className="placeholder-component"><h2>Progreso Component</h2></div>,
    };

    const menuItems = useMemo(() => {
        const configItems = menuConfig[userRole] || menuConfig['coach'];
        return configItems.map(item => ({
            ...item,
            component: componentMap[item.id] || (() => <div className="placeholder-component"><h2>Componente no encontrado</h2></div>)
        }));
    }, [userRole]);

    const activeMenuItem = menuItems.find(item => item.id === activeMenuId);
    const ActiveComponent = activeMenuItem?.component || Dashboard;

    const handleLogout = () => {
        onLogout();
    };

    const handleMenuSelect = (menuId) => {
        setActiveMenuId(menuId);
    };

    return (
        <div className="home-wrapper">
            <Header userName={email} onLogout={handleLogout} />
            <div className="home-content">
                <Sidebar items={menuItems} activeItem={activeMenuId} onSelect={handleMenuSelect} />
                <main className="home-main">
                    <ActiveComponent email={email} onLogout={onLogout} />
                </main>
            </div>
        </div>
    );
}

export default Home;

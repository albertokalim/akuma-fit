import { useState, useMemo } from 'react';
import Header from '../../components/complex/Header/Header.jsx';
import Sidebar from '../../components/complex/Sidebar/Sidebar.jsx';
import Dashboard from '../Dashboard/Dashboard.jsx';
import CheckIn from '../CheckIn/CheckIn.jsx';
import Progress from '../Progress/Progress.jsx';
import menuConfig from '../../config/menuConfig.json';
import './Home.css';
import ProfileForm from "../ProfileForm/ProfileForm.jsx";

function Home({ email, userId, onLogout, userRole = 'coach' }) {
    const [activeMenuId, setActiveMenuId] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showProfileForm, setShowProfileForm] = useState(false);

    const componentMap = {
        'dashboard': Dashboard,
        'checkin': CheckIn,
        'progress': Progress,
        'clients': () => <div className="placeholder-component"><h2>Clientes Component</h2></div>,
        'exercises': () => <div className="placeholder-component"><h2>Ejercicios Component</h2></div>,
        'alimentos': () => <div className="placeholder-component"><h2>Alimentos Component</h2></div>,
        'plans': () => <div className="placeholder-component"><h2>Planes Component</h2></div>,
        'reportes': () => <div className="placeholder-component"><h2>Reportes Component</h2></div>,
        'my-plan': () => <div className="placeholder-component"><h2>Mi Plan Component</h2></div>,
        'nutrition': () => <div className="placeholder-component"><h2>Nutrición Component</h2></div>,
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
        setShowProfileForm(false);
    };

    const handleMenuToggle = () => {
        setSidebarOpen((prev) => !prev);
    };

    const handleSidebarClose = () => {
        setSidebarOpen(false);
    };

    const handleProfileClick = () => {
        setShowProfileForm(true);
        setSidebarOpen(false);
    };

    const handleProfileSave = async (formData) => {
        // TODO: Implementar guardado en Supabase
        console.log('Guardar perfil:', formData);
    };

    return (
        <div className="home-wrapper">
            <Header
                onLogout={handleLogout}
                onMenuToggle={handleMenuToggle}
                menuOpen={sidebarOpen}
            />
            <div className="home-content">
                <Sidebar
                    userId={userId}
                    items={menuItems}
                    activeItem={activeMenuId}
                    onSelect={handleMenuSelect}
                    isOpen={sidebarOpen}
                    onClose={handleSidebarClose}
                    userName={email}
                    onProfileClick={handleProfileClick}
                />
                <main className="home-main">
                    {showProfileForm ? (
                        <ProfileForm
                            userId={userId}
                            initialData={{ email }}
                            onSave={handleProfileSave}
                        />
                    ) : (
                        <ActiveComponent email={email} onLogout={onLogout} />
                    )}
                </main>
            </div>
        </div>
    );
}

export default Home;

import { useState, useMemo } from 'react';
import Header from '../../components/complex/Header/Header.jsx';
import Sidebar from '../../components/complex/Sidebar/Sidebar.jsx';
import Dashboard from '../Dashboard/Dashboard.jsx';
import CheckIn from '../CheckIn/CheckIn.jsx';
import Progress from '../Progress/Progress.jsx';
import ProfileForm from '../ProfileForm/ProfileForm.jsx';
import CoachCheckIns from '../CoachCheckIns/CoachCheckIns.jsx';
import Reports from '../Reports/Reports.jsx';
import menuConfig from '../../config/menuConfig.json';
import './Home.css';

const PlaceholderComponent = ({ title }) => (
    <div className="placeholder-component">
        <h2>{title}</h2>
    </div>
);

const COMPONENT_MAP = {
    'dashboard': Dashboard,
    'checkin': CheckIn,
    'progress': Progress,
    'client-checkins': CoachCheckIns,
    'clients': () => <PlaceholderComponent title="Clientes Component" />,
    'exercises': () => <PlaceholderComponent title="Ejercicios Component" />,
    'alimentos': () => <PlaceholderComponent title="Alimentos Component" />,
    'plans': () => <PlaceholderComponent title="Planes Component" />,
    'reportes': Reports,
    'my-plan': () => <PlaceholderComponent title="Mi Plan Component" />,
    'nutrition': () => <PlaceholderComponent title="Nutrición Component" />,
};

function Home({ email, profileId, onLogout, userRole = 'coach' }) {
    const [activeMenuId, setActiveMenuId] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showProfileForm, setShowProfileForm] = useState(false);

    const menuItems = useMemo(() => {
        const configItems = menuConfig[userRole] || menuConfig['coach'];
        return configItems.map(item => ({
            ...item,
            component: COMPONENT_MAP[item.id] || (() => <PlaceholderComponent title="Componente no encontrado" />)
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
                    profileId={profileId}
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
                            profileId={profileId}
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

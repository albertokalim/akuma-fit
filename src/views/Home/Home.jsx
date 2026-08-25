import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/complex/Header/Header.jsx';
import Sidebar from '../../components/complex/Sidebar/Sidebar.jsx';
import SessionBanner from '../../components/complex/SessionBanner/SessionBanner.jsx';
import { useAuth } from '../../context/useAuth.js';
import menuConfig from '../../config/menuConfig.json';


/**
 * Layout de la app autenticada: cabecera + sidebar + <Outlet /> con la
 * sección activa, resuelta por react-router. El formulario de perfil es la
 * ruta "/app/profile".
 */
function AppLayout() {
    const { user, profileId, userRole, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = useMemo(() => menuConfig[userRole] || menuConfig.coach, [userRole]);

    const handleMenuToggle = () => setSidebarOpen((prev) => !prev);
    const handleSidebarClose = () => setSidebarOpen(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="home-wrapper">
            <Header
                onLogout={handleLogout}
                onMenuToggle={handleMenuToggle}
                menuOpen={sidebarOpen}
            />
            {!location.pathname.startsWith('/app/session') && <SessionBanner />}
            <div className="home-content">
                <Sidebar
                    items={menuItems}
                    isOpen={sidebarOpen}
                    onClose={handleSidebarClose}
                    userName={user}
                    profileId={profileId}
                />
                <main className="home-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AppLayout;


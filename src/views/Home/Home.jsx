import { useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../../components/complex/Header/Header.jsx';
import Sidebar from '../../components/complex/Sidebar/Sidebar.jsx';
import { useAuth } from '../../context/useAuth.js';
import menuConfig from '../../config/menuConfig.json';


/**
 * Layout de la app autenticada: cabecera + sidebar + <Outlet /> con la
 * sección activa, resuelta por react-router en vez de un estado local
 * (activeMenuId) que no sincronizaba con la URL. El formulario de perfil
 * ahora es la ruta "/app/profile" en vez de un booleano paralelo que podía
 * quedar desincronizado del menú activo.
 */
function AppLayout() {
    const { user, profileId, userRole, logout } = useAuth();
    const navigate = useNavigate();
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


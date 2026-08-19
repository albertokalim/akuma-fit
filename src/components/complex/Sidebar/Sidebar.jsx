import { useCallback } from 'react';
import { NavLink, Link } from 'react-router-dom';
import Avatar from '../../primitives/Avatar/Avatar.jsx';
import ICON_MAP from '../../../config/iconMap.jsx';
import { FiUser, FiX } from 'react-icons/fi';


 
function Sidebar({ items, isOpen, onClose, userName, profileId }) {
    const handleItemClick = useCallback(() => {
        if (onClose) onClose();
    }, [onClose]);

    const handleBackdropClick = useCallback(() => {
        if (onClose) onClose();
    }, [onClose]);

    return (
        <>
            {isOpen && <div className="sidebar-backdrop" onClick={handleBackdropClick} />}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <button className="sidebar-close-btn" onClick={onClose} aria-label="Cerrar menú">
                    <FiX size={24} />
                </button>
                <nav className="sidebar-nav">
                    <ul className="sidebar-items">
                        {items.map((item) => {
                            const Icon = ICON_MAP[item.icon];

                            return (
                                <li key={item.id}>
                                    <NavLink
                                        to={`/app/${item.id}`}
                                        className={({ isActive }) => isActive ? 'sidebar-item active' : 'sidebar-item'}
                                        onClick={handleItemClick}
                                    >
                                        {Icon && <span className="sidebar-icon"><Icon /></span>}
                                        <label className="sidebar-label">{item.label}</label>
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {userName && (
                    <Link to="/app/profile" className="sidebar-user-section" onClick={handleItemClick}>
                        <Avatar profileId={profileId} alt={userName} size="small" />
                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">{userName}</span>
                            <span className="sidebar-user-hint">Editar perfil</span>
                        </div>
                        <FiUser className="sidebar-user-icon" size={20} />
                    </Link>
                )}
            </aside>
        </>
    );
}

export default Sidebar;

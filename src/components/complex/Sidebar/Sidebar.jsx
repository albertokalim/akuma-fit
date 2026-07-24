import Label from '../../primitives/Label/Label.jsx';
import Avatar from '../../primitives/Avatar/Avatar.jsx';
import ICON_MAP from '../../../config/iconMap.jsx';
import { FiUser } from 'react-icons/fi';
import './Sidebar.css';

function Sidebar({ items, activeItem, onSelect, isOpen, onClose, userName, userId, onProfileClick }) {
    return (
        <>
            {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <nav className="sidebar-nav">
                    <ul className="sidebar-items">
                        {items.map((item) => {
                            const Icon = ICON_MAP[item.icon];
                            const isActive = activeItem === item.id;

                            return (
                                <li key={item.id}>
                                    <button
                                        className={isActive ? 'sidebar-item active' : 'sidebar-item'}
                                        onClick={() => {
                                            onSelect(item.id);
                                            if (onClose) onClose();
                                        }}
                                    >
                                        {Icon && <span className="sidebar-icon"><Icon /></span>}
                                        <Label text={item.label} className="sidebar-label" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {userName && (
                    <div className="sidebar-user-section" onClick={onProfileClick}>
                        <Avatar userId={userId} alt={userName} size="small" />
                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">{userName}</span>
                            <span className="sidebar-user-hint">Editar perfil</span>
                        </div>
                        <FiUser className="sidebar-user-icon" size={20} />
                    </div>
                )}
            </aside>
        </>
    );
}

export default Sidebar;

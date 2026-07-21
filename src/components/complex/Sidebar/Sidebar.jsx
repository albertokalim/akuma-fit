import Label from '../../primitives/Label/Label.jsx';
import ICON_MAP from '../../../config/iconMap.jsx';
import './Sidebar.css';

function Sidebar({ items, activeItem, onSelect }) {
    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                <ul className="sidebar-items">
                    {items.map((item) => {
                        const Icon = ICON_MAP[item.icon];

                        return (
                            <li key={item.id}>
                                <button
                                    className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
                                    onClick={() => onSelect(item.id)}
                                >
                                    {Icon && <span className="sidebar-icon"><Icon /></span>}
                                    <Label text={item.label} className="sidebar-label" />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;

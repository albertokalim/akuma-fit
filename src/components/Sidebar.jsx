import Label from './Label.jsx';
import './Sidebar.css';

function Sidebar({ items, activeItem, onSelect }) {
    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                <ul className="sidebar-items">
                    {items.map((item) => (
                        <li key={item.id}>
                            <button
                                className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`}
                                onClick={() => onSelect(item.id)}
                            >
                                {item.icon && <span className="sidebar-icon">{item.icon}</span>}
                                <Label text={item.label} className="sidebar-label" />
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;

import { FiMenu } from 'react-icons/fi';
import './Header.css';

function Header({ onLogout, onMenuToggle, menuOpen }) {
    return (
        <header className="header">
            <div className="header-left">
                <button
                    className="menu-toggle-btn"
                    onClick={onMenuToggle}
                    aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                >
                    <FiMenu size={24} />
                </button>
            </div>
            <div className="header-right">
                <button onClick={onLogout} className="logout-button">
                    <span className="button-text">Logout</span>
                </button>
            </div>
        </header>
    );
}

export default Header;

import Button from '../../primitives/Button/Button.jsx';
import { FiMenu, FiX } from 'react-icons/fi';
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
                    {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
            </div>
            <div className="header-right">
                <Button text="Logout" onClick={onLogout} className="logout-button" />
            </div>
        </header>
    );
}

export default Header;

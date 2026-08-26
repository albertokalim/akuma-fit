import { FiMenu } from 'react-icons/fi';


/**
 * Cabecera de la app: botón de menú (móvil) y botón de logout.
 *
 * @param {Object} props - Props del componente.
 * @param {() => void} props.onLogout - Callback de cierre de sesión.
 * @param {() => void} props.onMenuToggle - Callback para abrir/cerrar el menú.
 * @param {boolean} props.menuOpen - Si el menú lateral está abierto.
 */
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

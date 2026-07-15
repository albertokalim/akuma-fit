import Avatar from '../../primitives/Avatar/Avatar.jsx';
import Button from '../../primitives/Button/Button.jsx';
import Label from '../../primitives/Label/Label.jsx';
import './Header.css';

function Header({ userName, userAvatar, onLogout }) {
    return (
        <header className="header">
            <div className="header-left">
                <h1 className="header-title">AKUMA FIT</h1>
            </div>
            <div className="header-right">
                <div className="user-section">
                    {userAvatar && <Avatar src={userAvatar} alt={userName} size="small" />}
                    <Label text={userName} className="user-name" />
                </div>
                <Button text="Logout" onClick={onLogout} className="logout-button" />
            </div>
        </header>
    );
}

export default Header;

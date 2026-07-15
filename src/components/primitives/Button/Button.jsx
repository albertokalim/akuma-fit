
function Button({ text, onClick, className, icon }) {
    return <button
        onClick={onClick}
        className={className}
    >
        {icon && <span className="button-icon">{icon}</span>}
        {text}
    </button>;
}

export default Button;
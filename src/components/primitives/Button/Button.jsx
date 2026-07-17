
function Button({ text, onClick, className, icon, disabled }) {
    return <button
        onClick={onClick}
        className={className}
        disabled={disabled}
    >
        {icon && <span className="button-icon">{icon}</span>}
        {text}
    </button>;
}

export default Button;
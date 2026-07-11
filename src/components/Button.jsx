function Button({ text, onClick, className }) {
    return <input
        type="button"
        value={text || 'Button'}
        onClick={onClick}
        className={className}
    />;
}

export default Button;
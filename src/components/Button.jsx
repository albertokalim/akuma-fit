function Button({ text, onClick }) {
    return <input
        type="button"
        value={text || 'Button'}
        onClick={onClick}
    />;
}

export default Button;
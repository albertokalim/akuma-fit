 
function ColorSwatch({ color, className = '' }) {
    return (
        <span
            className={`option-color${className ? ` ${className}` : ''}`}
            style={{ backgroundColor: color }}
        />
    );
}

export default ColorSwatch;

 
/**
 * Muestra una pequeña muestra de color.
 *
 * @param {Object} props - Props del componente.
 * @param {string} props.color - Color de fondo de la muestra.
 * @param {string} [props.className] - Clases extra.
 */
function ColorSwatch({ color, className = '' }) {
    return (
        <span
            className={`option-color${className ? ` ${className}` : ''}`}
            style={{ backgroundColor: color }}
        />
    );
}

export default ColorSwatch;

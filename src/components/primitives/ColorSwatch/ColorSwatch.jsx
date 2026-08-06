/**
 * Pequeño indicador circular de color (usado en listas de opciones seleccionables
 * con color asociado, ej. metricas de Reports/Progress).
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

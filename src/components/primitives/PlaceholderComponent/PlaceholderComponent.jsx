 
/**
 * Componente provisional para secciones aún no implementadas.
 *
 * @param {Object} props - Props del componente.
 * @param {string} props.title - Título a mostrar.
 */
function PlaceholderComponent({ title }) {
    return (
        <div className="placeholder-component">
            <h2>{title}</h2>
        </div>
    );
}

export default PlaceholderComponent;

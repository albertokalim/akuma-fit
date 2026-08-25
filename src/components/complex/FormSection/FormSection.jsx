

/**
 * Sección de formulario con título y contenido.
 *
 * @param {Object} props - Props del componente.
 * @param {string} props.title - Título de la sección.
 * @param {React.ReactNode} props.children - Contenido de la sección.
 */
function FormSection({ title, children }) {
    return (
        <div className="form-section">
            <h2 className="form-section-title">{title}</h2>
            <div className="form-section-content">
                {children}
            </div>
        </div>
    );
}

export default FormSection;

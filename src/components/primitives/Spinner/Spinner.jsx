

/**
 * Indicador de carga con texto opcional.
 *
 * @param {Object} props - Props del componente.
 * @param {'small'|'medium'|'large'} [props.size='medium'] - Tamaño del spinner.
 * @param {string} [props.text='Cargando...'] - Texto a mostrar (vacío para ocultarlo).
 */
function Spinner({ size = 'medium', text = 'Cargando...' }) {
    return (
        <div className={`spinner-container spinner-${size}`}>
            <div className="spinner" />
            {text && <p className="spinner-text">{text}</p>}
        </div>
    );
}

export default Spinner;
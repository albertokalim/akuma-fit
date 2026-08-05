

function Spinner({ size = 'medium', text = 'Cargando...' }) {
    return (
        <div className={`spinner-container spinner-${size}`}>
            <div className="spinner" />
            {text && <p className="spinner-text">{text}</p>}
        </div>
    );
}

export default Spinner;
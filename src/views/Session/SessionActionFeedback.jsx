/**
 * Muestra el error o la pista de la acción en curso durante la sesión.
 *
 * @param {Object} props - Props del componente.
 * @param {string} [props.error] - Mensaje de error.
 * @param {string} [props.hint] - Pista informativa.
 */
function SessionActionFeedback({ error, hint }) {
    return (
        <>
            {error && <div className="error-message">{error}</div>}
            {hint && <div className="session-hint">{hint}</div>}
        </>
    );
}

export default SessionActionFeedback;

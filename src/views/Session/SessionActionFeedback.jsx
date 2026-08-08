/**
 * Mensaje de error persistente + hint temporal de una acción (guardar serie,
 * completar ejercicio, etc.). Compartido por los layouts móvil y escritorio
 * de TrainingView.
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

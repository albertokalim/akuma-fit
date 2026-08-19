 
function SessionActionFeedback({ error, hint }) {
    return (
        <>
            {error && <div className="error-message">{error}</div>}
            {hint && <div className="session-hint">{hint}</div>}
        </>
    );
}

export default SessionActionFeedback;

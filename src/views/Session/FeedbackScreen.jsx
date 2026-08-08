import { useState } from 'react';
import { FiCheckCircle } from 'react-icons/fi';

const FEELINGS = [
    { value: 'excelente', label: 'Excelente' },
    { value: 'bien', label: 'Bien' },
    { value: 'regular', label: 'Regular' },
    { value: 'mal', label: 'Mal' },
];

/**
 * Paso intermedio entre completar el último ejercicio y el resumen: el
 * cliente valora cómo ha ido la sesión (sensación general obligatoria +
 * notas opcionales). El RPE se recoge por ejercicio al completarlos, no aquí.
 */
function FeedbackScreen({ busy, onSubmit }) {
    const [feeling, setFeeling] = useState(null);
    const [notes, setNotes] = useState('');

    const handleSubmit = () => {
        if (!feeling) return;
        onSubmit({ feeling, notes: notes.trim() || null });
    };

    return (
        <div className="session-feedback-card">
            <div className="session-summary-badge">
                <FiCheckCircle size={28} />
            </div>
            <h2 className="session-feedback-title">¡Todo completado!</h2>
            <p className="session-feedback-subtitle">¿Cómo te has sentido en esta sesión?</p>

            <div className="session-feedback-field">
                <span className="session-feedback-label">Sensación general</span>
                <div className="session-feedback-options">
                    {FEELINGS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={`session-feedback-option ${feeling === option.value ? 'selected' : ''}`}
                            onClick={() => setFeeling(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="session-feedback-field">
                <label className="session-feedback-label" htmlFor="session-notes">
                    Notas (opcional)
                </label>
                <textarea
                    id="session-notes"
                    className="session-feedback-notes"
                    rows={3}
                    placeholder="¿Algo que quieras comentar sobre la sesión?"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                />
            </div>

            <button
                className="btn-primary btn-lg btn-block"
                disabled={!feeling || busy}
                onClick={handleSubmit}
            >
                {busy ? 'Finalizando...' : 'Finalizar sesión'}
            </button>
        </div>
    );
}

export default FeedbackScreen;

import { useState } from 'react';
import { eventService } from '../../services/eventService.js';
import { addDays, fromISODate, toISODate } from '../../utils/calendar.js';
import { formatDate } from '../../utils/data.js';

/**
 * Modal de edición/borrado de eventos del coach.
 *
 * Permite elegir el ámbito de la operación cuando el evento es recurrente:
 * - "Esta ocurrencia": modifica/cancela solo esa instancia (excepción).
 * - "Esta y las siguientes": parte la serie con `splitSeries` (o corta con
 *   `until` al eliminar).
 * - "Serie completa": actualiza/desactiva el maestro.
 *
 * @param {Object} props
 * @param {{date: string, event: Object}} props.occurrence - Ocurrencia clickada.
 * @param {() => void} props.onClose - Callback de cierre.
 * @param {() => void} props.onSaved - Callback tras guardar/eliminar.
 */
function EventEditModal({ occurrence, onClose, onSaved }) {
    const { date, event } = occurrence;
    const isRecurring = !!event.freq;

    const [scope, setScope] = useState(isRecurring ? 'this' : 'series');
    const [title, setTitle] = useState(event.title || '');
    const [description, setDescription] = useState(event.description || '');
    const [startTime, setStartTime] = useState(event.start_time ? event.start_time.slice(0, 5) : '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    const fields = () => ({
        title,
        description: description || null,
        startTime: startTime || null,
    });

    const handleSave = async () => {
        setBusy(true);
        setError(null);

        try {
            if (scope === 'series') {
                await eventService.update(event.id, fields());
            } else if (scope === 'this') {
                await eventService.modifyOccurrence(event.id, date, fields());
            } else {
                await eventService.splitSeries(event, date, fields());
            }
            onSaved();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        setBusy(true);
        setError(null);

        try {
            if (scope === 'series') {
                await eventService.remove(event.id);
            } else if (scope === 'this') {
                await eventService.cancelOccurrence(event.id, date);
            } else {
                const prev = toISODate(addDays(fromISODate(date), -1));
                await eventService.update(event.id, { until: prev });
            }
            onSaved();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Editar evento</h2>
                    <button type="button" className="btn-icon" onClick={onClose} aria-label="Cerrar">×</button>
                </div>

                <div className="modal-body">
                    <p className="event-edit-date">
                        {formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>

                    {isRecurring && (
                        <div className="event-edit-scope">
                            <label>
                                <input
                                    type="radio"
                                    name="edit-scope"
                                    checked={scope === 'this'}
                                    onChange={() => setScope('this')}
                                />
                                Esta ocurrencia
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="edit-scope"
                                    checked={scope === 'following'}
                                    onChange={() => setScope('following')}
                                />
                                Esta y las siguientes
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="edit-scope"
                                    checked={scope === 'series'}
                                    onChange={() => setScope('series')}
                                />
                                Serie completa
                            </label>
                        </div>
                    )}

                    <div className="form-field">
                        <label htmlFor="event-edit-title">Título</label>
                        <input
                            id="event-edit-title"
                            className="form-field-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="event-edit-description">Descripción</label>
                        <textarea
                            id="event-edit-description"
                            className="form-field-textarea"
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="event-edit-time">Hora (opcional)</label>
                        <input
                            id="event-edit-time"
                            type="time"
                            className="form-field-input"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}
                </div>

                <div className="calendar-modal-footer">
                    <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
                        Cancelar
                    </button>
                    <button type="button" className="btn-danger" onClick={handleDelete} disabled={busy}>
                        Eliminar
                    </button>
                    <button type="button" className="btn-primary" onClick={handleSave} disabled={busy}>
                        {busy ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EventEditModal;

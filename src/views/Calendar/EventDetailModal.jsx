import { formatDate } from '../../utils/data.js';

/**
 * Modal de solo lectura para eventos informativos: muestra título,
 * descripción, fecha y hora. No realiza ninguna acción adicional.
 *
 * @param {Object} props
 * @param {{date: string, event: Object}} props.occurrence - Ocurrencia clickada.
 * @param {() => void} props.onClose - Callback de cierre.
 */
function EventDetailModal({ occurrence, onClose }) {
    const { date, event } = occurrence;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{event.title}</h2>
                    <button type="button" className="btn-icon" onClick={onClose} aria-label="Cerrar">×</button>
                </div>

                <div className="modal-body">
                    <p className="event-detail-date">
                        {formatDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {event.start_time && (
                        <p className="event-detail-time">Hora: {event.start_time.slice(0, 5)}</p>
                    )}
                    {event.description ? (
                        <p className="event-detail-description">{event.description}</p>
                    ) : (
                        <p className="event-detail-description muted">Sin descripción.</p>
                    )}
                </div>

                <div className="calendar-modal-footer">
                    <button type="button" className="btn-primary" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
}

export default EventDetailModal;

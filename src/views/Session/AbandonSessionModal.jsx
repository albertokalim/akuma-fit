import { FiX } from 'react-icons/fi';

/**
 * Modal de confirmación para abandonar la sesión de entrenamiento.
 *
 * @param {Object} props - Props del componente.
 * @param {boolean} props.open - Si está abierto.
 * @param {boolean} props.busy - Si hay una acción en curso.
 * @param {() => void} props.onCancel - Callback de cancelar.
 * @param {() => void} props.onConfirm - Callback de confirmar abandono.
 */
function AbandonSessionModal({ open, busy, onCancel, onConfirm }) {
    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content session-abandon-modal" onClick={(event) => event.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Abandonar sesión</h2>
                    <button className="btn-icon" onClick={onCancel}>
                        <FiX size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    <p className="session-abandon-text">
                        ¿Seguro que quieres abandonar la sesión? Se perderá el progreso
                        no completado.
                    </p>
                    <div className="session-abandon-actions">
                        <button className="btn-secondary" onClick={onCancel} disabled={busy}>
                            Seguir entrenando
                        </button>
                        <button className="btn-danger" onClick={onConfirm} disabled={busy}>
                            {busy ? 'Abandonando...' : 'Abandonar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AbandonSessionModal;

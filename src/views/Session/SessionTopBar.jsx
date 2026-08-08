import { FiX } from 'react-icons/fi';
import { formatElapsed } from '../../hooks/useElapsedTime.js';

/**
 * Barra superior de la pantalla de entrenamiento: nombre de la rutina,
 * cronómetro, botón de abandonar y barra de progreso. Extraída de
 * TrainingView.jsx (antes se recreaba como función local en cada render).
 */
function SessionTopBar({ routineTitle, elapsedMs, completedCount, totalCount, progressPercent, busy, onAbandon }) {
    return (
        <div className="session-topbar">
            <div className="session-topbar-info">
                <span className="session-routine-name">{routineTitle}</span>
                <span className="session-timer">{formatElapsed(elapsedMs)}</span>
            </div>
            <button className="btn-outline btn-sm" onClick={onAbandon} disabled={busy}>
                <FiX size={14} />
                <span>Abandonar</span>
            </button>
            <div className="session-progress">
                <div className="session-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="session-progress-label">
                {completedCount}/{totalCount} ejercicios
            </span>
        </div>
    );
}

export default SessionTopBar;

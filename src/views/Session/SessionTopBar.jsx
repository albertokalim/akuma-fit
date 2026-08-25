import { FiX } from 'react-icons/fi';
import { formatElapsed } from '../../hooks/useElapsedTime.js';

/**
 * Barra superior de la sesión: nombre de la rutina, temporizador, progreso y
 * botón de abandonar.
 *
 * @param {Object} props - Props del componente.
 * @param {string} props.routineTitle - Título de la rutina.
 * @param {number} props.elapsedMs - Tiempo transcurrido.
 * @param {number} props.completedCount - Ejercicios completados.
 * @param {number} props.totalCount - Ejercicios totales.
 * @param {number} props.progressPercent - Porcentaje de progreso.
 * @param {boolean} props.busy - Si hay una acción en curso.
 * @param {() => void} props.onAbandon - Callback de abandonar.
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

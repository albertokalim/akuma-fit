import { Link } from 'react-router-dom';
import { FiActivity } from 'react-icons/fi';
import { useSession } from '../../../context/useSession.js';
import { useElapsedTime, formatElapsed } from '../../../hooks/useElapsedTime.js';

/**
 * Banner que muestra la sesión de entrenamiento en curso, con el tiempo
 * transcurrido y un enlace para reanudarla.
 */
function SessionBanner() {
    const { activeSession } = useSession();
    const elapsedMs = useElapsedTime(activeSession?.started_at);

    if (!activeSession) {
        return null;
    }

    return (
        <Link to="/app/session" className="session-banner">
            <FiActivity size={16} className="session-banner-icon" />
            <span className="session-banner-text">
                Sesión en curso · {formatElapsed(elapsedMs)}
            </span>
            <span className="session-banner-cta">Continuar</span>
        </Link>
    );
}

export default SessionBanner;

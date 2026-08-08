import { Link } from 'react-router-dom';
import { FiActivity } from 'react-icons/fi';
import { useSession } from '../../../context/useSession.js';
import { useElapsedTime, formatElapsed } from '../../../hooks/useElapsedTime.js';

/**
 * Barra bajo el header que avisa de que hay una sesión de entrenamiento en
 * curso (cronómetro en vivo) y lleva de vuelta a ella. Se muestra en todas
 * las pestañas menos en la propia vista de entrenamiento.
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

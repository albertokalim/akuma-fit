import { useIsMobile } from '../../hooks/useIsMobile.js';
import { useElapsedTime } from '../../hooks/useElapsedTime.js';
import { useTrainingSession } from './useTrainingSession.js';
import SessionTopBar from './SessionTopBar.jsx';
import AbandonSessionModal from './AbandonSessionModal.jsx';
import SessionActionFeedback from './SessionActionFeedback.jsx';
import FeedbackScreen from './FeedbackScreen.jsx';
import MobileTrainingView from './MobileTrainingView.jsx';
import DesktopTrainingView from './DesktopTrainingView.jsx';

/**
 * Paso 2: pantalla de entrenamiento.
 *
 * Orquesta el estado (useTrainingSession) y elige el layout según el ancho
 * de pantalla (móvil: swipe; escritorio: lista completa), pero no contiene
 * lógica de negocio propia: toda vive en useTrainingSession/sessionMappers,
 * y el gesto táctil en useSwipeGesture (usado sólo por MobileTrainingView).
 *
 * Todo lo que hace el usuario se persiste en Supabase en el momento (cada
 * serie al perder el foco, cada ejercicio al completarlo), así cerrar la
 * app o irse a otra pestaña no pierde nada: al volver, ActiveSessionLoader
 * recarga el estado persistido y esta vista se inicializa desde él, con el
 * cronómetro siguiendo desde `started_at`.
 */
function TrainingView({ session, routine, fullSession, onFinished, onCancelled }) {
    const isMobile = useIsMobile();
    const elapsedMs = useElapsedTime(session.started_at);
    const training = useTrainingSession({ session, routine, fullSession, onFinished, onCancelled });

    const {
        matchedExercises,
        currentIndex,
        setCurrentIndex,
        phase,
        busy,
        actionError,
        confirmAbandon,
        setConfirmAbandon,
        completedCount,
        progressPercent,
        handleFinishSession,
        handleAbandon,
    } = training;

    if (matchedExercises.length === 0) {
        return (
            <div className="session-page">
                <div className="page-container">
                    <h1 className="page-title">Entrenar</h1>
                    <div className="empty-state">
                        <p>Esta rutina no tiene ejercicios. Contacta con tu coach.</p>
                    </div>
                    <button className="btn-outline" onClick={() => setConfirmAbandon(true)}>
                        Abandonar sesión
                    </button>
                </div>
                <AbandonSessionModal
                    open={confirmAbandon}
                    busy={busy}
                    onCancel={() => setConfirmAbandon(false)}
                    onConfirm={handleAbandon}
                />
            </div>
        );
    }

    const topBar = (
        <SessionTopBar
            routineTitle={routine.title}
            elapsedMs={elapsedMs}
            completedCount={completedCount}
            totalCount={matchedExercises.length}
            progressPercent={progressPercent}
            busy={busy}
            onAbandon={() => setConfirmAbandon(true)}
        />
    );

    if (phase === 'feedback') {
        return (
            <div className="session-page session-training">
                {topBar}
                {actionError && <SessionActionFeedback error={actionError} />}
                <FeedbackScreen busy={busy} onSubmit={handleFinishSession} />
            </div>
        );
    }

    return (
        <div className="session-page session-training">
            {topBar}

            {isMobile ? (
                <MobileTrainingView
                    training={training}
                    currentIndex={currentIndex}
                    setCurrentIndex={setCurrentIndex}
                />
            ) : (
                <DesktopTrainingView training={training} />
            )}

            <AbandonSessionModal
                open={confirmAbandon}
                busy={busy}
                onCancel={() => setConfirmAbandon(false)}
                onConfirm={handleAbandon}
            />
        </div>
    );
}

export default TrainingView;

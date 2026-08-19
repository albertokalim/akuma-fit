import { useCallback, useState } from 'react';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { useSession } from '../../context/useSession.js';
import { routineService } from '../../services/routineService.js';
import { sessionService } from '../../services/sessionService.js';
import Spinner from '../../components/primitives/Spinner/Spinner.jsx';
import RoutinePicker from './RoutinePicker.jsx';
import TrainingView from './TrainingView.jsx';
import SessionSummary from './SessionSummary.jsx';

const RETRY_SPINNER_TEXT = 'Comprobando si tienes una sesión en curso...';

 
function Session() {
    const {
        activeSession,
        clearSession,
        checkingActiveSession,
        activeSessionCheckError,
        retryActiveSessionCheck,
    } = useSession();
    const [summary, setSummary] = useState(null);

    const handleFinished = useCallback((summaryData) => {
        setSummary(summaryData);
        clearSession();
    }, [clearSession]);

    const handleCancelled = useCallback(() => {
        clearSession();
    }, [clearSession]);

    if (summary) {
        return (
            <SessionSummary
                summary={summary}
                onNewSession={() => setSummary(null)}
            />
        );
    }

    if (activeSession) {
        return (
            <ActiveSessionLoader
                key={activeSession.id}
                session={activeSession}
                onFinished={handleFinished}
                onCancelled={handleCancelled}
            />
        );
    }

    if (checkingActiveSession) {
        return <Spinner text={RETRY_SPINNER_TEXT} />;
    }

    if (activeSessionCheckError) {
        return (
            <div className="session-page">
                <div className="page-container">
                    <div className="error-message">
                        No se pudo comprobar si tienes una sesión en curso: {activeSessionCheckError}
                    </div>
                    <button className="btn-primary" onClick={retryActiveSessionCheck}>
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return <RoutinePicker />;
}

 
function ActiveSessionLoader({ session, onFinished, onCancelled }) {
    const { data: routine, loading: routineLoading, error: routineError } = useAsyncData(
        () => routineService.getById(session.routine_id),
        [session.routine_id],
        null
    );

    const { data: fullSession, loading: sessionLoading, error: sessionError } = useAsyncData(
        () => sessionService.loadFull(session.id),
        [session.id],
        null
    );

    if (routineLoading || sessionLoading) {
        return <Spinner text="Cargando tu sesión..." />;
    }

    if (routineError || sessionError) {
        return <div className="error-message">Error: {routineError || sessionError}</div>;
    }

    if (!routine || !fullSession) {
        return <Spinner text="Preparando entrenamiento..." />;
    }

    return (
        <TrainingView
            session={session}
            routine={routine}
            fullSession={fullSession}
            onFinished={onFinished}
            onCancelled={onCancelled}
        />
    );
}

export default Session;

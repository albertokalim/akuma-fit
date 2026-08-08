import { useCallback, useState } from 'react';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { useSession } from '../../context/useSession.js';
import { routineService } from '../../services/routineService.js';
import { sessionService } from '../../services/sessionService.js';
import Spinner from '../../components/primitives/Spinner/Spinner.jsx';
import RoutinePicker from './RoutinePicker.jsx';
import TrainingView from './TrainingView.jsx';
import SessionSummary from './SessionSummary.jsx';

/**
 * Pestaña "Entrenar" del cliente. Máquina de estados con tres pantallas:
 *
 *  - Sin sesión activa: selector de rutina asignada (RoutinePicker).
 *  - Con sesión activa (recién creada o reanudada tras cerrar la app /
 *    navegar a otra pestaña): pantalla de entrenamiento (TrainingView).
 *  - Al terminar: resumen de la sesión (SessionSummary).
 *
 * La sesión activa vive en SessionContext (respaldada por Supabase), así
 * el estado sobrevive a recargas, cierres de la app y cambios de pestaña.
 */
function Session() {
    const { activeSession, clearSession } = useSession();
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

    return <RoutinePicker />;
}

/**
 * Carga la plantilla de la rutina y el estado persistido de la sesión antes
 * de montar TrainingView. Así TrainingView puede inicializar su estado
 * local directamente desde props (sin efectos de sincronización) y se
 * remonta limpio por cada sesión gracias al `key`.
 */
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

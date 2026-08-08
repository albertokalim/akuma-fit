import { useState } from 'react';
import { FiPlay } from 'react-icons/fi';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { routineService } from '../../services/routineService.js';
import { useAuth } from '../../context/useAuth.js';
import { useSession } from '../../context/useSession.js';

/**
 * Paso 1: el cliente elige qué rutina asignada quiere entrenar. Al pulsar
 * "Empezar sesión" se crea la sesión en Supabase inmediatamente (status
 * 'active'), de modo que si la app se cierra justo después, al volver a
 * entrar se reanuda en vez de perderse.
 */
function RoutinePicker() {
    const { profileId } = useAuth();
    const { startSession } = useSession();
    const [startingId, setStartingId] = useState(null);
    const [startError, setStartError] = useState(null);

    const loadRoutines = async () => routineService.getByClient(profileId);

    const { data: routines, loading, error } = useAsyncData(
        profileId ? loadRoutines : null,
        [profileId]
    );

    const handleStart = async (routine) => {
        setStartingId(routine.id);
        setStartError(null);

        try {
            await startSession(routine);
        } catch (err) {
            setStartError(err.message);
            setStartingId(null);
        }
    };

    if (loading) {
        return <div className="loading-state">Cargando tus rutinas...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="session-page">
            <div className="page-container">
                <h1 className="page-title">Entrenar</h1>
                <p className="page-description">
                    Elige una rutina para empezar tu sesión de entrenamiento.
                </p>

                {startError && <div className="error-message">{startError}</div>}

                {!routines || routines.length === 0 ? (
                    <div className="empty-state">
                        <p>Tu coach aún no te ha asignado ninguna rutina.</p>
                    </div>
                ) : (
                    <div className="routines-grid">
                        {routines.map((routine) => {
                            const exerciseCount = routine.exercises?.length || 0;
                            const totalSets = (routine.exercises || [])
                                .reduce((acc, exercise) => acc + (exercise.sets?.length || 0), 0);
                            const isStarting = startingId === routine.id;

                            return (
                                <div key={routine.id} className="routine-card session-routine-card">
                                    <h3 className="routine-card-title">{routine.title}</h3>
                                    {routine.coach_comment && (
                                        <p className="routine-card-comment">{routine.coach_comment}</p>
                                    )}
                                    <div className="routine-card-footer">
                                        <span className="routine-card-stat">
                                            {exerciseCount} {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'} · {totalSets} series
                                        </span>
                                    </div>
                                    <button
                                        className="btn-primary btn-block"
                                        disabled={isStarting || exerciseCount === 0}
                                        onClick={() => handleStart(routine)}
                                    >
                                        <FiPlay size={16} />
                                        <span>{isStarting ? 'Empezando...' : 'Empezar sesión'}</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default RoutinePicker;

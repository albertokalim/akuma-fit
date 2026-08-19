import { FiCheck, FiClock, FiActivity, FiCheckCircle, FiSmile } from 'react-icons/fi';
import StatCard from '../../components/complex/StatCard/StatCard.jsx';
import { formatElapsed } from '../../hooks/useElapsedTime.js';

const FEELING_LABELS = {
    excelente: 'Excelente',
    bien: 'Bien',
    regular: 'Regular',
    mal: 'Mal',
};

 
function SessionSummary({ summary, onNewSession }) {
    const volumeLabel = `${Math.round(summary.totalVolume).toLocaleString('es-ES')} kg`;

    return (
        <div className="session-page">
            <div className="page-container">
                <div className="session-summary-header">
                    <div className="session-summary-badge">
                        <FiCheckCircle size={28} />
                    </div>
                    <h1 className="page-title">¡Sesión completada!</h1>
                    <p className="page-description">{summary.routineTitle}</p>
                </div>

                <div className="stats-grid">
                    <StatCard icon={<FiClock />} value={formatElapsed(summary.durationMs)} label="Duración" />
                    <StatCard
                        icon={<FiActivity />}
                        value={`${summary.exercisesCompleted}/${summary.exercisesTotal}`}
                        label="Ejercicios completados"
                    />
                    <StatCard
                        icon={<FiCheck />}
                        value={`${summary.completedSets}/${summary.totalSets}`}
                        label="Series registradas"
                    />
                    <StatCard icon={<FiActivity />} value={volumeLabel} label="Volumen total" />
                    {summary.feeling && (
                        <StatCard
                            icon={<FiSmile />}
                            value={FEELING_LABELS[summary.feeling] || summary.feeling}
                            label="Sensación"
                        />
                    )}
                </div>

                {summary.notes && (
                    <div className="session-summary-notes">
                        <h2 className="section-title">Notas</h2>
                        <p className="session-summary-notes-text">{summary.notes}</p>
                    </div>
                )}

                <div className="session-summary-detail">
                    <h2 className="section-title">Desglose</h2>
                    {summary.exercises.map((exercise, index) => (
                        <div
                            key={`${exercise.name}-${index}`}
                            className={`session-summary-exercise ${exercise.completed ? 'completed' : ''}`}
                        >
                            <div className="session-summary-exercise-header">
                                <span className="session-exercise-name">{exercise.name}</span>
                                <span className="session-summary-exercise-meta">
                                    {exercise.rpe && (
                                        <span className="session-rpe-badge">RPE {exercise.rpe}</span>
                                    )}
                                    {exercise.completed && <FiCheck className="session-exercise-check" size={16} />}
                                </span>
                            </div>
                            <div className="session-summary-sets">
                                {exercise.sets.map((set) => (
                                    <span key={set.order} className="session-summary-set">
                                        {set.order}. {set.reps ?? '—'} reps
                                        {set.kg ? ` · ${set.kg} kg` : ''}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <button className="btn-primary btn-lg" onClick={onNewSession}>
                    Nueva sesión
                </button>
            </div>
        </div>
    );
}

export default SessionSummary;

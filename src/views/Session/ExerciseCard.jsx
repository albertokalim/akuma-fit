import { FiCheck } from 'react-icons/fi';
import ExerciseVideo from '../../components/complex/ExerciseVideo/ExerciseVideo.jsx';

const RPE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * Tarjeta de un ejercicio dentro de la sesión: información de la plantilla
 * (descripción, comentarios del coach y video explicativo), tabla de series
 * con inputs de reps/kg (precargados como placeholder con los valores
 * prescritos), selector de RPE y botón de completar/desmarcar. Compartida
 * por el layout móvil (una tarjeta con swipe) y el de escritorio (lista
 * completa).
 */
function ExerciseCard({
    exercise,
    index,
    completed,
    canComplete,
    busy,
    setValues,
    rpe,
    onSetChange,
    onSetBlur,
    onRpeChange,
    onComplete,
    onUnmark,
}) {
    const sets = exercise.sets || [];

    return (
        <div className={`session-exercise-card ${completed ? 'completed' : ''}`}>
            <div className="session-exercise-header">
                <div className="session-exercise-title-row">
                    <span className="session-exercise-number">Ejercicio {index + 1}</span>
                    <h3 className="session-exercise-name">{exercise.exercise_name}</h3>
                    {completed && <FiCheck className="session-exercise-check" size={20} />}
                </div>
                {exercise.category && <span className="category-badge">{exercise.category}</span>}
            </div>

            {exercise.description && (
                <p className="session-exercise-description">{exercise.description}</p>
            )}

            {exercise.comments && (
                <p className="session-exercise-comment">{exercise.comments}</p>
            )}

            <ExerciseVideo exerciseId={exercise.id} />

            <div className="sets-table session-sets-table">
                <div className="sets-table-header session-sets-header">
                    <span className="set-col-order">#</span>
                    <span className="set-col-reps">Reps</span>
                    <span className="set-col-kg">Kg</span>
                    <span className="set-col-type">Tipo</span>
                </div>
                {sets.map((set) => {
                    const value = setValues[`${exercise.id}:${set.order}`] || {};

                    return (
                        <div key={set.id} className="sets-table-row session-sets-row">
                            <span className="set-col-order set-order-number">{set.order}</span>
                            <input
                                type="number"
                                inputMode="numeric"
                                min="0"
                                className="set-input"
                                placeholder={set.reps || '—'}
                                value={value.reps ?? ''}
                                onChange={(event) => onSetChange(exercise, set.order, 'reps', event.target.value)}
                                onBlur={() => onSetBlur(exercise, set)}
                            />
                            <input
                                type="number"
                                inputMode="decimal"
                                min="0"
                                step="0.5"
                                className="set-input"
                                placeholder={set.kg || '—'}
                                value={value.kg ?? ''}
                                onChange={(event) => onSetChange(exercise, set.order, 'kg', event.target.value)}
                                onBlur={() => onSetBlur(exercise, set)}
                            />
                            <span className="set-col-type">{set.type}</span>
                        </div>
                    );
                })}
            </div>

            {completed ? (
                <div className="session-exercise-actions">
                    {rpe && <span className="session-rpe-badge">RPE {rpe}</span>}
                    <button className="btn-outline" onClick={onUnmark} disabled={busy}>
                        Marcar como pendiente
                    </button>
                </div>
            ) : (
                <>
                    <div className="session-rpe">
                        <span className="session-rpe-label">Esfuerzo percibido (RPE) — opcional</span>
                        <div className="session-rpe-scale">
                            {RPE_VALUES.map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    className={`session-rpe-btn ${rpe === value ? 'selected' : ''}`}
                                    onClick={() => onRpeChange(exercise, rpe === value ? null : value)}
                                    aria-label={`RPE ${value}`}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>
                        <div className="session-rpe-hints">
                            <span>Suave</span>
                            <span>Máximo</span>
                        </div>
                    </div>

                    <div className="session-exercise-actions">
                        <button
                            className="btn-primary btn-block"
                            onClick={onComplete}
                            disabled={!canComplete || busy}
                        >
                            <FiCheck size={16} />
                            <span>Completar ejercicio</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ExerciseCard;

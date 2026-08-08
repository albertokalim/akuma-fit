import ExerciseCard from './ExerciseCard.jsx';
import SessionActionFeedback from './SessionActionFeedback.jsx';

/**
 * Layout de escritorio de la pantalla de entrenamiento: lista completa de
 * ejercicios, cada uno completándose de forma independiente (sin swipe ni
 * animación de salida).
 */
function DesktopTrainingView({ training }) {
    const { matchedExercises, setValues, completedMap, rpeMap, busy, actionError, hint } = training;

    return (
        <>
            <SessionActionFeedback error={actionError} hint={hint} />

            <div className="session-exercises-list">
                {matchedExercises.map(({ exercise, row }, index) => (
                    <ExerciseCard
                        key={row.id}
                        exercise={exercise}
                        row={row}
                        index={index}
                        completed={!!completedMap[row.id]}
                        canComplete={training.isExerciseComplete(row, exercise)}
                        busy={busy}
                        setValues={setValues}
                        rpe={rpeMap[row.id] ?? null}
                        onSetChange={training.handleSetChange}
                        onSetBlur={training.handleSetBlur}
                        onRpeChange={training.handleRpeChange}
                        onComplete={() => training.handleCompleteExercise(row, exercise, index)}
                        onUnmark={() => training.handleUnmarkExercise(row)}
                    />
                ))}
            </div>
        </>
    );
}

export default DesktopTrainingView;

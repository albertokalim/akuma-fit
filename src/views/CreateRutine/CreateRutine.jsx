import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import useFormSubmission from '../../hooks/useFormSubmission.js';
import { rutineService } from '../../services/rutineService.js';
import './CreateRutine.css';

const EXERCISE_CATEGORIES = [
    'Fuerza',
    'Cardio',
    'Movilidad',
    'Core',
    'Pliometría',
    'Otros',
];

const SET_TYPES = [
    'Normal',
    'Calentamiento',
    'Aproximación',
    'Drop set',
    'Rest-pause',
    'Tempo',
];

function CreateRutine() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [coachComment, setCoachComment] = useState('');
    const [exercises, setExercises] = useState([]);
    const [expandedExercises, setExpandedExercises] = useState({});

    const {
        submitting,
        submitError,
        submitSuccess,
        handleSubmit,
    } = useFormSubmission({
        onSuccess: () => {
            setTimeout(() => navigate('/app/plans'), 1200);
        },
    });

    const addExercise = () => {
        const newExercise = {
            id: Date.now(),
            name: '',
            description: '',
            comments: '',
            category: 'Fuerza',
            sets: [{ id: Date.now() + 1, order: 1, reps: '', kg: '', type: 'Normal' }],
        };
        setExercises([...exercises, newExercise]);
        setExpandedExercises({ ...expandedExercises, [newExercise.id]: true });
    };

    const removeExercise = (exerciseId) => {
        setExercises(exercises.filter(e => e.id !== exerciseId));
    };

    const updateExercise = (exerciseId, field, value) => {
        setExercises(exercises.map(e =>
            e.id === exerciseId ? { ...e, [field]: value } : e
        ));
    };

    const addSet = (exerciseId) => {
        setExercises(exercises.map(e => {
            if (e.id === exerciseId) {
                const newSet = {
                    id: Date.now(),
                    order: e.sets.length + 1,
                    reps: '',
                    kg: '',
                    type: 'Normal',
                };
                return { ...e, sets: [...e.sets, newSet] };
            }
            return e;
        }));
    };

    const removeSet = (exerciseId, setId) => {
        setExercises(exercises.map(e => {
            if (e.id === exerciseId) {
                const newSets = e.sets.filter(s => s.id !== setId)
                    .map((s, idx) => ({ ...s, order: idx + 1 }));
                return { ...e, sets: newSets };
            }
            return e;
        }));
    };

    const updateSet = (exerciseId, setId, field, value) => {
        setExercises(exercises.map(e => {
            if (e.id === exerciseId) {
                const newSets = e.sets.map(s =>
                    s.id === setId ? { ...s, [field]: value } : s
                );
                return { ...e, sets: newSets };
            }
            return e;
        }));
    };

    const toggleExercise = (exerciseId) => {
        setExpandedExercises({
            ...expandedExercises,
            [exerciseId]: !expandedExercises[exerciseId],
        });
    };

    const onSubmit = async () => {
        const rutineData = {
            title,
            coachComment,
            exercises: exercises.map(e => ({
                name: e.name,
                description: e.description,
                comments: e.comments,
                category: e.category,
                sets: e.sets.map(s => ({
                    order: s.order,
                    reps: s.reps,
                    kg: s.kg,
                    type: s.type,
                })),
            })),
        };
        await rutineService.create(rutineData);
    };

    const onSubmitClick = () => handleSubmit(onSubmit);

    const isFormValid = title.trim() !== '' && exercises.length > 0 &&
        exercises.every(e => e.name.trim() !== '' && e.sets.length > 0);

    return (
        <div className="create-rutine-page">
            <div className="create-rutine-container">
                <h1 className="create-rutine-title">Crear Rutina</h1>
                <p className="create-rutine-description">
                    Diseña una rutina de entrenamiento personalizada para tu cliente.
                </p>

                <div className="rutine-form-section">
                    <h2 className="section-subtitle">Información General</h2>
                    <div className="form-field">
                        <label htmlFor="rutine-title">Título de la Rutina *</label>
                        <input
                            id="rutine-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Rutina de Fuerza - Nivel Intermedio"
                            className="form-field-input"
                        />
                    </div>
                    <div className="form-field">
                        <label htmlFor="coach-comment">Comentario del Coach</label>
                        <textarea
                            id="coach-comment"
                            value={coachComment}
                            onChange={(e) => setCoachComment(e.target.value)}
                            placeholder="Notas adicionales sobre la rutina..."
                            className="form-field-textarea"
                            rows="3"
                        />
                    </div>
                </div>

                <div className="exercises-section">
                    <div className="exercises-header">
                        <h2 className="section-subtitle">Ejercicios</h2>
                        <button onClick={addExercise} className="btn-outline">
                            <FiPlus size={16} />
                            <span>Agregar Ejercicio</span>
                        </button>
                    </div>

                    {exercises.length === 0 ? (
                        <div className="empty-state">
                            <p>No hay ejercicios agregados. Haz clic en "Agregar Ejercicio" para comenzar.</p>
                        </div>
                    ) : (
                        <div className="exercises-list">
                            {exercises.map((exercise, idx) => (
                                <div key={exercise.id} className="exercise-card">
                                    <div className="exercise-header">
                                        <div className="exercise-title-row">
                                            <span className="exercise-number">Ejercicio {idx + 1}</span>
                                            <span className="exercise-name-preview">
                                                {exercise.name || 'Sin nombre'}
                                            </span>
                                        </div>
                                        <div className="exercise-actions">
                                            <button
                                                onClick={() => toggleExercise(exercise.id)}
                                                className="btn-icon"
                                                title={expandedExercises[exercise.id] ? 'Contraer' : 'Expandir'}
                                            >
                                                {expandedExercises[exercise.id] ? <FiChevronUp /> : <FiChevronDown />}
                                            </button>
                                            <button
                                                onClick={() => removeExercise(exercise.id)}
                                                className="btn-icon btn-icon-danger"
                                                title="Eliminar ejercicio"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>

                                    {expandedExercises[exercise.id] && (
                                        <div className="exercise-content">
                                            <div className="exercise-fields">
                                                <div className="form-field">
                                                    <label>Nombre del Ejercicio *</label>
                                                    <input
                                                        type="text"
                                                        value={exercise.name}
                                                        onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                                                        placeholder="Ej: Sentadilla con barra"
                                                        className="form-field-input"
                                                    />
                                                </div>
                                                <div className="form-field">
                                                    <label>Categoría</label>
                                                    <select
                                                        value={exercise.category}
                                                        onChange={(e) => updateExercise(exercise.id, 'category', e.target.value)}
                                                        className="form-field-input"
                                                    >
                                                        {EXERCISE_CATEGORIES.map(cat => (
                                                            <option key={cat} value={cat}>{cat}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="form-field">
                                                    <label>Descripción</label>
                                                    <textarea
                                                        value={exercise.description}
                                                        onChange={(e) => updateExercise(exercise.id, 'description', e.target.value)}
                                                        placeholder="Descripción técnica del ejercicio..."
                                                        className="form-field-textarea"
                                                        rows="2"
                                                    />
                                                </div>
                                                <div className="form-field">
                                                    <label>Comentarios</label>
                                                    <textarea
                                                        value={exercise.comments}
                                                        onChange={(e) => updateExercise(exercise.id, 'comments', e.target.value)}
                                                        placeholder="Notas adicionales para el cliente..."
                                                        className="form-field-textarea"
                                                        rows="2"
                                                    />
                                                </div>
                                            </div>

                                            <div className="sets-section">
                                                <div className="sets-header">
                                                    <h3 className="sets-title">Series</h3>
                                                    <button onClick={() => addSet(exercise.id)} className="btn-outline btn-sm">
                                                        <FiPlus size={14} />
                                                        <span>Agregar Serie</span>
                                                    </button>
                                                </div>

                                                {exercise.sets.length === 0 ? (
                                                    <p className="sets-empty">No hay series. Agrega al menos una serie.</p>
                                                ) : (
                                                    <div className="sets-table">
                                                        <div className="sets-table-header">
                                                            <span className="set-col-order">#</span>
                                                            <span className="set-col-reps">Reps</span>
                                                            <span className="set-col-kg">Kg</span>
                                                            <span className="set-col-type">Tipo</span>
                                                            <span className="set-col-actions"></span>
                                                        </div>
                                                        {exercise.sets.map((set) => (
                                                            <div key={set.id} className="sets-table-row">
                                                                <span className="set-col-order set-order-number">{set.order}</span>
                                                                <div className="set-col-reps">
                                                                    <input
                                                                        type="text"
                                                                        value={set.reps}
                                                                        onChange={(e) => updateSet(exercise.id, set.id, 'reps', e.target.value)}
                                                                        placeholder="Ej: 8-10"
                                                                        className="set-input"
                                                                    />
                                                                </div>
                                                                <div className="set-col-kg">
                                                                    <input
                                                                        type="text"
                                                                        value={set.kg}
                                                                        onChange={(e) => updateSet(exercise.id, set.id, 'kg', e.target.value)}
                                                                        placeholder="Ej: 60"
                                                                        className="set-input"
                                                                    />
                                                                </div>
                                                                <div className="set-col-type">
                                                                    <select
                                                                        value={set.type}
                                                                        onChange={(e) => updateSet(exercise.id, set.id, 'type', e.target.value)}
                                                                        className="set-input"
                                                                    >
                                                                        {SET_TYPES.map(type => (
                                                                            <option key={type} value={type}>{type}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                <div className="set-col-actions">
                                                                    <button
                                                                        onClick={() => removeSet(exercise.id, set.id)}
                                                                        className="btn-icon btn-icon-danger btn-icon-sm"
                                                                        title="Eliminar serie"
                                                                    >
                                                                        <FiTrash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="create-rutine-footer">
                    {submitError && <div className="error-message">{submitError}</div>}
                    {submitSuccess && <div className="success-message">¡Rutina creada correctamente!</div>}

                    <div className="form-buttons">
                        <button
                            onClick={() => navigate('/app/plans')}
                            disabled={submitting}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onSubmitClick}
                            disabled={submitting || !isFormValid}
                            className="btn-primary"
                        >
                            {submitting ? 'Creando...' : 'Crear Rutina'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateRutine;

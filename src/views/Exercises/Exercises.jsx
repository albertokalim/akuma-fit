import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiX, FiTag } from 'react-icons/fi';
import { exerciseService } from '../../services/exerciseService.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';

const EXERCISE_CATEGORIES = [
    'Todas',
    'Fuerza',
    'Cardio',
    'Movilidad',
    'Core',
    'Pliometría',
    'Otros',
];

function Exercises() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [selectedTags, setSelectedTags] = useState([]);
    const [allTags, setAllTags] = useState([]);

    const loadExercises = async () => {
        const [exercises, allExercises] = await Promise.all([
            exerciseService.search({
                text: searchText || undefined,
                category: selectedCategory !== 'Todas' ? selectedCategory : undefined,
                tags: selectedTags.length > 0 ? selectedTags : undefined,
            }),
            exerciseService.getAll(),
        ]);
        const tagSet = new Map();
        allExercises.forEach(ex => ex.tags?.forEach(tag => tagSet.set(tag.id, tag)));
        const tags = Array.from(tagSet.values()).sort((a, b) => a.name.localeCompare(b.name));
        setAllTags(tags);
        return exercises;
    };

    const { data: exercises, loading, error } = useAsyncData(loadExercises, [searchText, selectedCategory, selectedTags]);

    const toggleTag = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    const clearFilters = () => {
        setSearchText('');
        setSelectedCategory('Todas');
        setSelectedTags([]);
    };

    const hasActiveFilters = searchText || selectedCategory !== 'Todas' || selectedTags.length > 0;

    return (
        <div className="exercises-page">
            <div className="page-container">
                <div className="page-header">
                    <h1 className="page-title">Ejercicios</h1>
                    <button onClick={() => navigate('/app/exercises/new')} className="btn-primary">
                        <FiPlus size={18} />
                        <span>Nuevo Ejercicio</span>
                    </button>
                </div>

                <div className="filters-row">
                    <div className="search-box">
                        <FiSearch className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o descripción..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="search-input"
                        />
                        {searchText && (
                            <button onClick={() => setSearchText('')} className="clear-search">
                                <FiX size={16} />
                            </button>
                        )}
                    </div>

                    <div className="category-filter">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="category-select"
                        >
                            {EXERCISE_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="btn-outline btn-sm">
                            Limpiar filtros
                        </button>
                    )}
                </div>

                {allTags.length > 0 && (
                    <div className="tags-filter">
                        <span className="tags-filter-label">
                            <FiTag size={14} />
                            Tags:
                        </span>
                        <div className="tags-list">
                            {allTags.map(tag => (
                                <button
                                    key={tag.id}
                                    onClick={() => toggleTag(tag.id)}
                                    className={`tag-chip ${selectedTags.includes(tag.id) ? 'active' : ''}`}
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="loading-state">Cargando ejercicios...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : !exercises || exercises.length === 0 ? (
                    <div className="empty-state">
                        <p>No se encontraron ejercicios.</p>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="btn-outline">
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="exercises-grid">
                        {exercises.map(exercise => (
                            <div key={exercise.id} className="exercise-card">
                                <div className="exercise-card-header">
                                    <h3 className="exercise-card-title">{exercise.exercise_name}</h3>
                                    <span className="category-badge">{exercise.category}</span>
                                </div>
                                {exercise.description && (
                                    <p className="exercise-card-description">{exercise.description}</p>
                                )}
                                {exercise.comments && (
                                    <p className="exercise-card-comments">{exercise.comments}</p>
                                )}
                                {exercise.tags && exercise.tags.length > 0 && (
                                    <div className="exercise-card-tags">
                                        {exercise.tags.map(tag => (
                                            <span key={tag.id} className="tag-badge">
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div className="exercise-card-actions">
                                    <button
                                        onClick={() => navigate(`/app/exercises/${exercise.id}/edit`)}
                                        className="btn-outline btn-sm"
                                    >
                                        Editar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Exercises;

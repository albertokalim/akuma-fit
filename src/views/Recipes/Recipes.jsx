import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiX, FiClock, FiUsers, FiTrash2 } from 'react-icons/fi';
import Button from '../../components/primitives/Button/Button.jsx';
import { recipeService } from '../../services/recipeService.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { recipeServingMacros, formatMacros } from '../../utils/dietMacros.js';

function Recipes() {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = useDebouncedValue(searchText);
    const [reloadKey, setReloadKey] = useState(0);

    const loadRecipes = async () => recipeService.getAll({
        text: debouncedSearchText || undefined,
    });

    const { data: recipes, loading, error } = useAsyncData(
        loadRecipes,
        [debouncedSearchText, reloadKey]
    );

    const handleDelete = async (recipe) => {
        if (!window.confirm(`¿Eliminar la receta "${recipe.name}"?`)) return;

        try {
            await recipeService.delete(recipe.id);
            setReloadKey(key => key + 1);
        } catch (err) {
            window.alert(`No se pudo eliminar: ${err.message}`);
        }
    };

    return (
        <div className="diet-page">
            <div className="page-container">
                <div className="page-header">
                    <h1 className="page-title">Recetas</h1>
                    <Button onClick={() => navigate('/app/recetas/new')}>
                        <FiPlus size={18} />
                        <span>Nueva receta</span>
                    </Button>
                </div>

                <div className="filters-row">
                    <div className="search-box">
                        <FiSearch className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            className="search-input"
                        />
                        {searchText && (
                            <button onClick={() => setSearchText('')} className="clear-search">
                                <FiX size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">Cargando recetas...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : !recipes || recipes.length === 0 ? (
                    <div className="empty-state">
                        <p>{searchText
                            ? 'No se encontraron recetas con ese nombre.'
                            : 'Aún no hay recetas. Crea la primera.'}</p>
                    </div>
                ) : (
                    <div className="recipes-grid">
                        {recipes.map(recipe => (
                            <div key={recipe.id} className="recipe-card">
                                <div className="recipe-card-header">
                                    <h3 className="recipe-card-title">{recipe.name}</h3>
                                    <button
                                        className="btn-icon btn-icon-danger"
                                        onClick={() => handleDelete(recipe)}
                                        title="Eliminar receta"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>

                                {recipe.description && (
                                    <p className="recipe-card-description">{recipe.description}</p>
                                )}

                                <div className="recipe-card-meta">
                                    {recipe.preparation_time && (
                                        <span className="recipe-card-stat">
                                            <FiClock size={14} />
                                            {recipe.preparation_time} min
                                        </span>
                                    )}
                                    <span className="recipe-card-stat">
                                        <FiUsers size={14} />
                                        {recipe.servings} {recipe.servings === 1 ? 'ración' : 'raciones'}
                                    </span>
                                </div>

                                <span className="recipe-card-macros">
                                    Por ración: {formatMacros(recipeServingMacros(recipe))}
                                </span>

                                {recipe.tags.length > 0 && (
                                    <div className="exercise-card-tags">
                                        {recipe.tags.map(tag => (
                                            <span key={tag.id} className="tag-badge">{tag.name}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="exercise-card-actions">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate(`/app/recetas/${recipe.id}/edit`)}
                                    >
                                        Editar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Recipes;

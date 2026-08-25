import { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { foodService } from '../../../services/foodService.js';
import { recipeService } from '../../../services/recipeService.js';
import { useAsyncData } from '../../../hooks/useAsyncData.js';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue.js';
import { recipeServingMacros, formatMacros } from '../../../utils/dietMacros.js';

/**
 * Modal para elegir un alimento o una receta y añadirlo a una comida, con
 * pestañas y búsqueda.
 *
 * @param {Object} props - Props del componente.
 * @param {() => void} props.onClose - Callback de cierre.
 * @param {(food: Object) => void} props.onPickFood - Callback al elegir un alimento.
 * @param {(recipe: Object) => void} props.onPickRecipe - Callback al elegir una receta.
 */
function DietItemPicker({ onClose, onPickFood, onPickRecipe }) {
    const [tab, setTab] = useState('foods');
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const loadFoods = async () => foodService.getAll({
        text: debouncedSearchText || undefined,
    });

    const loadRecipes = async () => recipeService.getAll({
        text: debouncedSearchText || undefined,
    });

    const { data: foods, loading: foodsLoading, error: foodsError } = useAsyncData(
        tab === 'foods' ? loadFoods : null,
        [debouncedSearchText, tab],
        []
    );

    const { data: recipes, loading: recipesLoading, error: recipesError } = useAsyncData(
        tab === 'recipes' ? loadRecipes : null,
        [debouncedSearchText, tab],
        []
    );

    const loading = tab === 'foods' ? foodsLoading : recipesLoading;
    const error = tab === 'foods' ? foodsError : recipesError;
    const items = tab === 'foods' ? foods : recipes;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(event) => event.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Añadir a la comida</h2>
                    <button className="btn-icon" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <div className="reports-tabs">
                    <button
                        className={`tab-button ${tab === 'foods' ? 'active' : ''}`}
                        onClick={() => setTab('foods')}
                    >
                        Alimentos
                    </button>
                    <button
                        className={`tab-button ${tab === 'recipes' ? 'active' : ''}`}
                        onClick={() => setTab('recipes')}
                    >
                        Recetas
                    </button>
                </div>

                <div className="modal-filters">
                    <div className="search-box">
                        <FiSearch className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="loading-state">Cargando...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : items.length === 0 ? (
                        <div className="empty-state">
                            <p>No se encontraron resultados.</p>
                        </div>
                    ) : (
                        <div className="food-picker-list">
                            {tab === 'foods'
                                ? items.map(food => (
                                    <button
                                        key={food.id}
                                        type="button"
                                        className="food-picker-item"
                                        onClick={() => onPickFood(food)}
                                    >
                                        <div className="food-picker-info">
                                            <span className="food-picker-name">{food.name}</span>
                                            {food.brand && (
                                                <span className="food-picker-brand">{food.brand}</span>
                                            )}
                                        </div>
                                        <span className="food-picker-macros">
                                            {food.calories ?? 0} kcal/100g
                                        </span>
                                    </button>
                                ))
                                : items.map(recipe => (
                                    <button
                                        key={recipe.id}
                                        type="button"
                                        className="food-picker-item"
                                        onClick={() => onPickRecipe(recipe)}
                                    >
                                        <div className="food-picker-info">
                                            <span className="food-picker-name">{recipe.name}</span>
                                            <span className="food-picker-brand">
                                                {recipe.servings} {recipe.servings === 1 ? 'ración' : 'raciones'}
                                            </span>
                                        </div>
                                        <span className="food-picker-macros">
                                            {formatMacros(recipeServingMacros(recipe))}/ración
                                        </span>
                                    </button>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DietItemPicker;

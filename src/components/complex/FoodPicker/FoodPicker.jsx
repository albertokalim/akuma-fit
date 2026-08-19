import { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { foodService } from '../../../services/foodService.js';
import { useAsyncData } from '../../../hooks/useAsyncData.js';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue.js';

function FoodPicker({ title = 'Seleccionar alimento', onSelect, onClose }) {
    const [searchText, setSearchText] = useState('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const loadFoods = async () => foodService.getAll({
        text: debouncedSearchText || undefined,
    });

    const { data: foods, loading, error } = useAsyncData(loadFoods, [debouncedSearchText]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(event) => event.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button className="btn-icon" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <div className="modal-filters">
                    <div className="search-box">
                        <FiSearch className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o marca..."
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="loading-state">Cargando alimentos...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : !foods || foods.length === 0 ? (
                        <div className="empty-state">
                            <p>No se encontraron alimentos.</p>
                        </div>
                    ) : (
                        <div className="food-picker-list">
                            {foods.map(food => (
                                <button
                                    key={food.id}
                                    type="button"
                                    className="food-picker-item"
                                    onClick={() => onSelect(food)}
                                >
                                    <div className="food-picker-info">
                                        <span className="food-picker-name">{food.name}</span>
                                        {food.brand && (
                                            <span className="food-picker-brand">{food.brand}</span>
                                        )}
                                    </div>
                                    <span className="food-picker-macros">
                                        {food.calories ?? 0} kcal · P {food.protein ?? 0}
                                        {' '}· C {food.carbs ?? 0} · F {food.fat ?? 0}
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

export default FoodPicker;

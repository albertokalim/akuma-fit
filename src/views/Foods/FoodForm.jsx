import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { foodService } from '../../services/foodService.js';
import TagPicker from '../../components/complex/TagPicker/TagPicker.jsx';

const DIET_TAG_CATEGORY = 'dieta';

const EMPTY_FORM = {
    name: '',
    brand: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    serving_size: '',
};

function toFormValues(food) {
    return {
        name: food.name || '',
        brand: food.brand || '',
        calories: food.calories ?? '',
        protein: food.protein ?? '',
        carbs: food.carbs ?? '',
        fat: food.fat ?? '',
        fiber: food.fiber ?? '',
        serving_size: food.serving_size || '',
    };
}

function toNumeric(value) {
    if (value === '' || value === null || value === undefined) return null;
    const numeric = Number(value);
    return Number.isNaN(numeric) ? null : numeric;
}

/**
 * Modal de alta/edición de un alimento. Los macros se introducen por 100 g.
 * `food` = null para crear; objeto para editar.
 */
function FoodForm({ food, onClose, onSaved }) {
    const isEditing = Boolean(food);

    const [values, setValues] = useState(() => (food ? toFormValues(food) : EMPTY_FORM));
    const [selectedTags, setSelectedTags] = useState(food?.tags || []);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const handleChange = (field, rawValue) => {
        setValues(prev => ({ ...prev, [field]: rawValue }));
    };

    const handleSubmit = async () => {
        if (!values.name.trim()) return;

        setSubmitting(true);
        setSubmitError(null);

        const payload = {
            name: values.name.trim(),
            brand: values.brand.trim(),
            calories: toNumeric(values.calories),
            protein: toNumeric(values.protein),
            carbs: toNumeric(values.carbs),
            fat: toNumeric(values.fat),
            fiber: toNumeric(values.fiber),
            serving_size: values.serving_size.trim(),
        };

        const tagIds = selectedTags.map(tag => tag.id);

        try {
            if (isEditing) {
                await foodService.update(food.id, payload, tagIds);
            } else {
                await foodService.create(payload, tagIds);
            }
            onSaved();
        } catch (err) {
            setSubmitError(err.message);
            setSubmitting(false);
        }
    };

    const isValid = values.name.trim() !== '';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content diet-modal" onClick={(event) => event.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">{isEditing ? 'Editar alimento' : 'Nuevo alimento'}</h2>
                    <button className="btn-icon" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="diet-form-grid">
                        <div className="form-field diet-form-span-2">
                            <label>Nombre *</label>
                            <input
                                type="text"
                                value={values.name}
                                onChange={(event) => handleChange('name', event.target.value)}
                                placeholder="Ej: Pechuga de pollo"
                                className="form-field-input"
                            />
                        </div>

                        <div className="form-field">
                            <label>Marca</label>
                            <input
                                type="text"
                                value={values.brand}
                                onChange={(event) => handleChange('brand', event.target.value)}
                                placeholder="Opcional"
                                className="form-field-input"
                            />
                        </div>

                        <div className="form-field">
                            <label>Ración de referencia</label>
                            <input
                                type="text"
                                value={values.serving_size}
                                onChange={(event) => handleChange('serving_size', event.target.value)}
                                placeholder="Ej: 100 g, 1 unidad"
                                className="form-field-input"
                            />
                        </div>
                    </div>

                    <h3 className="diet-form-subtitle">Macros por 100 g</h3>
                    <div className="diet-form-grid diet-form-macros">
                        <div className="form-field">
                            <label>Kcal</label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={values.calories}
                                onChange={(event) => handleChange('calories', event.target.value)}
                                className="form-field-input"
                            />
                        </div>
                        <div className="form-field">
                            <label>Proteínas (g)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={values.protein}
                                onChange={(event) => handleChange('protein', event.target.value)}
                                className="form-field-input"
                            />
                        </div>
                        <div className="form-field">
                            <label>Carbohidratos (g)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={values.carbs}
                                onChange={(event) => handleChange('carbs', event.target.value)}
                                className="form-field-input"
                            />
                        </div>
                        <div className="form-field">
                            <label>Grasas (g)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={values.fat}
                                onChange={(event) => handleChange('fat', event.target.value)}
                                className="form-field-input"
                            />
                        </div>
                        <div className="form-field">
                            <label>Fibra (g)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={values.fiber}
                                onChange={(event) => handleChange('fiber', event.target.value)}
                                className="form-field-input"
                            />
                        </div>
                    </div>

                    <h3 className="diet-form-subtitle">Tags</h3>
                    <TagPicker
                        selectedTags={selectedTags}
                        onChange={setSelectedTags}
                        category={DIET_TAG_CATEGORY}
                        placeholder="Ej: sin gluten, alto en proteína..."
                    />

                    {submitError && <div className="error-message">{submitError}</div>}
                </div>

                <div className="diet-modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={submitting}>
                        Cancelar
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={!isValid || submitting}
                    >
                        {submitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear alimento'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FoodForm;

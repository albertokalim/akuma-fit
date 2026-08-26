import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { foodService } from '../../services/foodService.js';
import TagPicker from '../../components/complex/TagPicker/TagPicker.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import useFormSubmission from '../../hooks/useFormSubmission.js';

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

function FoodFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [values, setValues] = useState(EMPTY_FORM);
    const [selectedTags, setSelectedTags] = useState([]);

    const loadData = async () => {
        if (!isEditing) return true;

        const food = await foodService.getById(id);
        setValues(toFormValues(food));
        setSelectedTags(food.tags || []);
        return true;
    };

    const { loading } = useAsyncData(loadData, [id], null);

    const { submitting, submitError, submitSuccess, handleSubmit } = useFormSubmission({
        onSuccess: () => {
            setTimeout(() => navigate('/app/alimentos'), 1200);
        },
    });

    const handleChange = (field, rawValue) => {
        setValues(prev => ({ ...prev, [field]: rawValue }));
    };

    const onSubmit = async () => {
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

        if (isEditing) {
            await foodService.update(id, payload, tagIds);
        } else {
            await foodService.create(payload, tagIds);
        }
    };

    const isValid = values.name.trim() !== '';

    if (loading) {
        return <div className="loading-state">Cargando...</div>;
    }

    return (
        <div className="diet-form-page">
            <div className="page-container">
                <h1 className="page-title">
                    {isEditing ? 'Editar alimento' : 'Nuevo alimento'}
                </h1>
                <p className="page-description">
                    {isEditing
                        ? 'Modifica los datos nutricionales del alimento.'
                        : 'Añade un nuevo alimento a la biblioteca.'}
                </p>

                <div className="form-section-card">
                    <h2 className="section-subtitle">Información básica</h2>

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
                </div>

                <div className="form-section-card">
                    <h2 className="section-subtitle">Macros por 100 g</h2>

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
                </div>

                <div className="form-section-card">
                    <h2 className="section-subtitle">Tags</h2>
                    <TagPicker
                        selectedTags={selectedTags}
                        onChange={setSelectedTags}
                        category={DIET_TAG_CATEGORY}
                        placeholder="Ej: sin gluten, alto en proteína..."
                    />
                </div>

                <div className="form-footer">
                    {submitError && <div className="error-message">{submitError}</div>}
                    {submitSuccess && (
                        <div className="success-message">
                            {isEditing ? '¡Alimento actualizado!' : '¡Alimento creado!'}
                        </div>
                    )}

                    <div className="form-buttons">
                        <button
                            onClick={() => navigate('/app/alimentos')}
                            disabled={submitting}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => handleSubmit(onSubmit)}
                            disabled={!isValid || submitting}
                            className="btn-primary"
                        >
                            {submitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear alimento'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FoodFormPage;

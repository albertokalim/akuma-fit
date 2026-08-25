import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FiPlus,
    FiTrash2,
    FiChevronUp,
    FiChevronDown,
    FiCopy,
    FiAlertTriangle,
} from 'react-icons/fi';
import { mealPlanService } from '../../services/mealPlanService.js';
import { assessmentService } from '../../services/assessmentService.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import useFormSubmission from '../../hooks/useFormSubmission.js';
import DietItemPicker from '../../components/complex/DietItemPicker/DietItemPicker.jsx';
import { itemMacros, slotMacros, dayMacros, formatMacros } from '../../utils/dietMacros.js';

/**
 * Input de texto editable inline que guarda al perder el foco.
 *
 * @param {Object} props - Props del componente.
 * @param {string} props.value - Valor actual.
 * @param {(value: string) => void} props.onSave - Callback al guardar.
 * @param {string} [props.placeholder] - Placeholder.
 * @param {string} [props.className] - Clases extra.
 */
function InlineText({ value, onSave, placeholder, className }) {
    const [draft, setDraft] = useState(value ?? '');

    return (
        <input
            type="text"
            className={className}
            value={draft}
            placeholder={placeholder}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => {
                if (draft !== value) onSave(draft);
            }}
            onKeyDown={(event) => {
                if (event.key === 'Enter') event.target.blur();
            }}
        />
    );
}

/**
 * Input numérico editable inline que guarda al perder el foco.
 *
 * @param {Object} props - Props del componente.
 * @param {number|null} props.value - Valor actual.
 * @param {(value: number|null) => void} props.onSave - Callback al guardar.
 * @param {string} [props.className] - Clases extra.
 * @param {string} [props.step='0.1'] - Paso del input.
 */
function InlineNumber({ value, onSave, className, step = '0.1' }) {
    const [draft, setDraft] = useState(value ?? '');

    return (
        <input
            type="number"
            min="0"
            step={step}
            className={className}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => {
                const parsed = draft === '' ? null : Number(draft);
                const normalized = parsed === null || Number.isNaN(parsed) ? null : parsed;
                if (normalized !== value) onSave(normalized);
            }}
            onKeyDown={(event) => {
                if (event.key === 'Enter') event.target.blur();
            }}
        />
    );
}

/**
 * Formulario de datos generales de un plan (título, descripción y macros
 * objetivo).
 *
 * @param {Object} props - Props del componente.
 * @param {Object} props.plan - Plan.
 * @param {() => void} props.onSaved - Callback tras guardar.
 */
function PlanHeaderForm({ plan, onSaved }) {
    const [title, setTitle] = useState(plan.title);
    const [description, setDescription] = useState(plan.description || '');
    const [targetCalories, setTargetCalories] = useState(plan.target_calories ?? '');
    const [targetProtein, setTargetProtein] = useState(plan.target_protein ?? '');
    const [targetCarbs, setTargetCarbs] = useState(plan.target_carbs ?? '');
    const [targetFat, setTargetFat] = useState(plan.target_fat ?? '');

    const { submitting, submitError, submitSuccess, handleSubmit } = useFormSubmission({
        onSuccess: onSaved,
    });

    const toNumber = (value) => (value === '' ? null : Number(value));

    const onSubmit = async () => {
        await mealPlanService.update(plan.id, {
            title: title.trim(),
            description: description.trim(),
            target_calories: toNumber(targetCalories),
            target_protein: toNumber(targetProtein),
            target_carbs: toNumber(targetCarbs),
            target_fat: toNumber(targetFat),
        });
    };

    return (
        <div className="form-section-card">
            <h2 className="section-subtitle">Datos del plan</h2>

            <div className="form-field">
                <label>Título *</label>
                <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="form-field-input"
                />
            </div>

            <div className="form-field">
                <label>Descripción</label>
                <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows="2"
                    className="form-field-textarea"
                />
            </div>

            <h3 className="diet-form-subtitle">Macros objetivo por día (opcional)</h3>
            <div className="diet-form-grid diet-form-macros">
                <div className="form-field">
                    <label>Kcal</label>
                    <input
                        type="number"
                        min="0"
                        value={targetCalories}
                        onChange={(event) => setTargetCalories(event.target.value)}
                        className="form-field-input"
                    />
                </div>
                <div className="form-field">
                    <label>Proteínas (g)</label>
                    <input
                        type="number"
                        min="0"
                        value={targetProtein}
                        onChange={(event) => setTargetProtein(event.target.value)}
                        className="form-field-input"
                    />
                </div>
                <div className="form-field">
                    <label>Carbohidratos (g)</label>
                    <input
                        type="number"
                        min="0"
                        value={targetCarbs}
                        onChange={(event) => setTargetCarbs(event.target.value)}
                        className="form-field-input"
                    />
                </div>
                <div className="form-field">
                    <label>Grasas (g)</label>
                    <input
                        type="number"
                        min="0"
                        value={targetFat}
                        onChange={(event) => setTargetFat(event.target.value)}
                        className="form-field-input"
                    />
                </div>
            </div>

            {submitError && <div className="error-message">{submitError}</div>}
            {submitSuccess && <div className="success-message">Plan guardado.</div>}

            <div className="form-buttons">
                <button
                    className="btn-primary"
                    disabled={submitting || title.trim() === ''}
                    onClick={() => handleSubmit(onSubmit)}
                >
                    {submitting ? 'Guardando...' : 'Guardar datos del plan'}
                </button>
            </div>
        </div>
    );
}

/**
 * Asignación/desasignación de clientes a un plan, mostrando sus restricciones
 * alimentarias.
 *
 * @param {Object} props - Props del componente.
 * @param {Object} props.plan - Plan con sus clientes.
 * @param {() => void} props.onSaved - Callback tras un cambio.
 */
function PlanAssignment({ plan, onSaved }) {
    const { data: clients } = useAsyncData(() => mealPlanService.getClients(), [], []);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [busy, setBusy] = useState(false);

    const { data: restrictions } = useAsyncData(
        selectedClientId
            ? async () => {
                const assessment = await assessmentService.getByProfile(selectedClientId);
                return assessment?.food_restrictions || null;
            }
            : null,
        [selectedClientId],
        null
    );

    const assignedIds = plan.clients.map(client => client.id);
    const assignableClients = clients.filter(client => !assignedIds.includes(client.id));

    const handleAssign = async () => {
        if (!selectedClientId) return;

        setBusy(true);
        try {
            await mealPlanService.assign(selectedClientId, plan.id);
            setSelectedClientId('');
            onSaved();
        } finally {
            setBusy(false);
        }
    };

    const handleUnassign = async (clientId) => {
        setBusy(true);
        try {
            await mealPlanService.unassign(clientId, plan.id);
            onSaved();
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="form-section-card">
            <h2 className="section-subtitle">Clientes asignados</h2>

            {plan.clients.length > 0 ? (
                <div className="diet-assigned-list">
                    {plan.clients.map(client => (
                        <div key={client.id} className="diet-assigned-item">
                            <span>{client.name} {client.surname}</span>
                            <button
                                className="btn-outline btn-sm"
                                disabled={busy}
                                onClick={() => handleUnassign(client.id)}
                            >
                                Desasignar
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="section-help">Este plan aún no está asignado a ningún cliente.</p>
            )}

            <div className="diet-assign-row">
                <select
                    className="category-select"
                    value={selectedClientId}
                    onChange={(event) => setSelectedClientId(event.target.value)}
                >
                    <option value="">Seleccionar cliente...</option>
                    {assignableClients.map(client => (
                        <option key={client.id} value={client.id}>
                            {client.name} {client.surname}
                        </option>
                    ))}
                </select>
                <button
                    className="btn-primary"
                    disabled={!selectedClientId || busy}
                    onClick={handleAssign}
                >
                    Asignar
                </button>
            </div>

            {selectedClientId && restrictions && (
                <div className="alert-item alert-warning">
                    <FiAlertTriangle className="alert-icon" size={18} />
                    <span>Este cliente tiene restricciones alimentarias: {restrictions}</span>
                </div>
            )}
        </div>
    );
}

/**
 * Fila de un ítem dentro de una comida, con cantidad/raciones editables y
 * acciones de mover/eliminar.
 *
 * @param {Object} props - Props del componente.
 * @param {Object} props.item - Ítem.
 * @param {boolean} props.busy - Si hay una acción en curso.
 * @param {(item: Object, changes: Object) => void} props.onUpdate - Callback de actualización.
 * @param {(itemId: number, direction: number) => void} props.onMove - Callback de mover.
 * @param {(itemId: number) => void} props.onRemove - Callback de eliminar.
 */
function ItemRow({ item, busy, onUpdate, onMove, onRemove }) {
    const macros = itemMacros(item);

    return (
        <div className="diet-item-row">
            <span className="diet-item-name">
                {item.food ? item.food.name : `${item.recipe.name} (receta)`}
            </span>

            {item.food ? (
                <div className="diet-item-quantity">
                    <InlineNumber
                        value={item.quantity_g}
                        onSave={(value) => onUpdate(item, { quantity_g: value })}
                        className="set-input"
                    />
                    <span className="diet-item-unit">g</span>
                </div>
            ) : (
                <div className="diet-item-quantity">
                    <InlineNumber
                        value={item.servings}
                        onSave={(value) => onUpdate(item, { servings: value })}
                        className="set-input"
                    />
                    <span className="diet-item-unit">raciones</span>
                </div>
            )}

            <InlineText
                value={item.notes}
                onSave={(value) => onUpdate(item, { notes: value })}
                placeholder="Notas"
                className="diet-item-notes"
            />

            <span className="diet-item-macros">{formatMacros(macros)}</span>

            <div className="diet-row-actions">
                <button className="btn-icon" disabled={busy} onClick={() => onMove(item.id, -1)} title="Subir">
                    <FiChevronUp size={16} />
                </button>
                <button className="btn-icon" disabled={busy} onClick={() => onMove(item.id, 1)} title="Bajar">
                    <FiChevronDown size={16} />
                </button>
                <button
                    className="btn-icon btn-icon-danger"
                    disabled={busy}
                    onClick={() => onRemove(item.id)}
                    title="Eliminar"
                >
                    <FiTrash2 size={16} />
                </button>
            </div>
        </div>
    );
}

/**
 * Editor de un plan de alimentación: datos generales, asignación de clientes
 * y estructura de días -> comidas -> ítems. En modo creación delega en
 * {@link PlanCreate}.
 */
function MealPlanEditor() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [reloadKey, setReloadKey] = useState(0);
    const [busy, setBusy] = useState(false);
    const [actionError, setActionError] = useState(null);
    const [pickerSlotId, setPickerSlotId] = useState(null);

    const { data: plan, loading, error } = useAsyncData(
        isEditing ? () => mealPlanService.getById(id) : null,
        [id, reloadKey],
        null
    );

    const reload = () => setReloadKey(key => key + 1);

    const runAction = async (action) => {
        setBusy(true);
        setActionError(null);

        try {
            await action();
            reload();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const handleUpdateItem = (item, changes) => runAction(() => mealPlanService.updateItem(item.id, {
        quantity_g: changes.quantity_g !== undefined ? changes.quantity_g : item.quantity_g,
        servings: changes.servings !== undefined ? changes.servings : item.servings,
        notes: changes.notes !== undefined ? changes.notes : item.notes,
    }));

    const handlePickFood = (food) => runAction(async () => {
        await mealPlanService.addItem(pickerSlotId, { food_id: food.id, quantity_g: 100 });
        setPickerSlotId(null);
    });

    const handlePickRecipe = (recipe) => runAction(async () => {
        await mealPlanService.addItem(pickerSlotId, { recipe_id: recipe.id, servings: 1 });
        setPickerSlotId(null);
    });

    if (!isEditing) {
        return <PlanCreate />;
    }

    if (loading && !plan) {
        return <div className="loading-state">Cargando plan...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    if (!plan) {
        return <div className="loading-state">Cargando plan...</div>;
    }

    return (
        <div className="diet-page">
            <div className="page-container">
                <div className="page-header">
                    <h1 className="page-title">{plan.title}</h1>
                    <button className="btn-outline" onClick={() => navigate('/app/dietas')}>
                        Volver a dietas
                    </button>
                </div>

                {actionError && <div className="error-message">{actionError}</div>}

                <PlanHeaderForm key={`header-${plan.id}-${reloadKey}`} plan={plan} onSaved={reload} />
                <PlanAssignment key={`assign-${plan.id}-${reloadKey}`} plan={plan} onSaved={reload} />

                <div className="diet-days">
                    {plan.days.map((day, dayIndex) => (
                        <div key={day.id} className="diet-day-card">
                            <div className="diet-day-header">
                                <InlineText
                                    value={day.label}
                                    onSave={(value) => runAction(() => mealPlanService.updateDay(day.id, { label: value }))}
                                    className="diet-day-label"
                                />
                                <span className="diet-day-macros">{formatMacros(dayMacros(day))}</span>
                                <div className="diet-row-actions">
                                    <button
                                        className="btn-icon"
                                        disabled={busy || dayIndex === 0}
                                        onClick={() => runAction(() => mealPlanService.moveDay(day.id, -1))}
                                        title="Subir día"
                                    >
                                        <FiChevronUp size={16} />
                                    </button>
                                    <button
                                        className="btn-icon"
                                        disabled={busy || dayIndex === plan.days.length - 1}
                                        onClick={() => runAction(() => mealPlanService.moveDay(day.id, 1))}
                                        title="Bajar día"
                                    >
                                        <FiChevronDown size={16} />
                                    </button>
                                    <button
                                        className="btn-icon"
                                        disabled={busy}
                                        onClick={() => runAction(() => mealPlanService.copyDay(day.id))}
                                        title="Duplicar día"
                                    >
                                        <FiCopy size={16} />
                                    </button>
                                    <button
                                        className="btn-icon btn-icon-danger"
                                        disabled={busy}
                                        onClick={() => {
                                            if (window.confirm('¿Eliminar este día con todas sus comidas?')) {
                                                runAction(() => mealPlanService.removeDay(day.id));
                                            }
                                        }}
                                        title="Eliminar día"
                                    >
                                        <FiTrash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="diet-slots">
                                {day.slots.map((slot, slotIndex) => (
                                    <div key={slot.id} className="diet-slot-card">
                                        <div className="diet-slot-header">
                                            <InlineText
                                                value={slot.label}
                                                onSave={(value) => runAction(() => mealPlanService.updateSlot(slot.id, { label: value }))}
                                                className="diet-slot-label"
                                            />
                                            <span className="diet-slot-macros">{formatMacros(slotMacros(slot))}</span>
                                            <div className="diet-row-actions">
                                                <button
                                                    className="btn-icon"
                                                    disabled={busy || slotIndex === 0}
                                                    onClick={() => runAction(() => mealPlanService.moveSlot(slot.id, -1))}
                                                    title="Subir comida"
                                                >
                                                    <FiChevronUp size={16} />
                                                </button>
                                                <button
                                                    className="btn-icon"
                                                    disabled={busy || slotIndex === day.slots.length - 1}
                                                    onClick={() => runAction(() => mealPlanService.moveSlot(slot.id, 1))}
                                                    title="Bajar comida"
                                                >
                                                    <FiChevronDown size={16} />
                                                </button>
                                                <button
                                                    className="btn-icon btn-icon-danger"
                                                    disabled={busy}
                                                    onClick={() => {
                                                        if (window.confirm('¿Eliminar esta comida?')) {
                                                            runAction(() => mealPlanService.removeSlot(slot.id));
                                                        }
                                                    }}
                                                    title="Eliminar comida"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {slot.items.map((item) => (
                                            <ItemRow
                                                key={item.id}
                                                item={item}
                                                busy={busy}
                                                onUpdate={handleUpdateItem}
                                                onMove={(itemId, direction) => runAction(() => mealPlanService.moveItem(itemId, direction))}
                                                onRemove={(itemId) => runAction(() => mealPlanService.removeItem(itemId))}
                                            />
                                        ))}

                                        <button
                                            className="btn-outline btn-sm diet-add-item-btn"
                                            disabled={busy}
                                            onClick={() => setPickerSlotId(slot.id)}
                                        >
                                            <FiPlus size={14} />
                                            <span>Añadir alimento o receta</span>
                                        </button>
                                    </div>
                                ))}

                                <button
                                    className="btn-outline diet-add-slot-btn"
                                    disabled={busy}
                                    onClick={() => runAction(() => mealPlanService.addSlot(day.id))}
                                >
                                    <FiPlus size={14} />
                                    <span>Añadir comida</span>
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        className="btn-secondary diet-add-day-btn"
                        disabled={busy}
                        onClick={() => runAction(() => mealPlanService.addDay(plan.id))}
                    >
                        <FiPlus size={16} />
                        <span>Añadir día</span>
                    </button>
                </div>
            </div>

            {pickerSlotId && (
                <DietItemPicker
                    onClose={() => setPickerSlotId(null)}
                    onPickFood={handlePickFood}
                    onPickRecipe={handlePickRecipe}
                />
            )}
        </div>
    );
}

/**
 * Formulario de creación de un plan (título y descripción). Tras crear,
 * navega al editor del plan.
 */
function PlanCreate() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const handleCreate = async () => {
        if (!title.trim()) return;

        setSubmitting(true);
        setSubmitError(null);

        try {
            const plan = await mealPlanService.create({ title: title.trim(), description: description.trim() });
            navigate(`/app/dietas/${plan.id}/edit`, { replace: true });
        } catch (err) {
            setSubmitError(err.message);
            setSubmitting(false);
        }
    };

    return (
        <div className="diet-page">
            <div className="page-container">
                <h1 className="page-title">Nuevo plan de alimentación</h1>
                <p className="page-description">
                    Crea el plan y después añade los días, comidas y alimentos.
                </p>

                <div className="form-section-card">
                    <div className="form-field">
                        <label>Título *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            placeholder="Ej: Plan de definición - Semana 1"
                            className="form-field-input"
                        />
                    </div>

                    <div className="form-field">
                        <label>Descripción</label>
                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows="2"
                            className="form-field-textarea"
                        />
                    </div>

                    {submitError && <div className="error-message">{submitError}</div>}

                    <div className="form-buttons">
                        <button className="btn-secondary" onClick={() => navigate('/app/dietas')} disabled={submitting}>
                            Cancelar
                        </button>
                        <button
                            className="btn-primary"
                            disabled={!title.trim() || submitting}
                            onClick={handleCreate}
                        >
                            {submitting ? 'Creando...' : 'Crear plan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MealPlanEditor;

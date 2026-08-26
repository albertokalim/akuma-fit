import { useState } from 'react';
import DynamicForm from '../../components/complex/DynamicForm/DynamicForm.jsx';
import FORM_SECTIONS from '../../config/weightLogFields.json';
import useFormSubmission from '../../hooks/useFormSubmission.js';
import { measurementService } from '../../services/measurementService.js';


const ALL_FIELDS = FORM_SECTIONS.flatMap((section) => section.fields);
const FIELD_LABELS_BY_ID = Object.fromEntries(ALL_FIELDS.map((field) => [field.id, field.label]));

/**
 * Formulario de registro de peso y medidas, construido desde
 * `weightLogFields.json`.
 *
 * @param {Object} props - Props del componente.
 * @param {() => void} [props.onComplete] - Callback al completar.
 * @param {() => void} [props.onCancel] - Callback de cancelación.
 */
function WeightLogForm({ onComplete, onCancel }) {
    const [measurement, setMeasurement] = useState({});

    const {
        fieldValidity,
        submitAttempted,
        submitting,
        submitError,
        submitSuccess,
        handleValidityChange,
        handleSubmit,
    } = useFormSubmission({
        fieldLabelsById: FIELD_LABELS_BY_ID,
        onSuccess: () => {
            if (onComplete) {
                setTimeout(() => onComplete(), 1200);
            }
        },
    });

    const handleFieldChange = (group, event) => {
        const { id, name, value } = event.target;
        const key = name || id;
        setMeasurement((prev) => ({ ...prev, [key]: value }));
    };

    const onSubmit = async () => {
        await measurementService.create(measurement);
    };

    const onSubmitClick = () => handleSubmit(onSubmit);

    return (
        <div className="weight-log-form">
            <h1 className="weight-log-form-title">Registro de peso</h1>
            <p className="weight-log-form-description">Registra tu peso y, si quieres, tus medidas corporales para poder hacer un seguimiento de tu progreso. Solo el peso es obligatorio.</p>

            <DynamicForm
                sections={FORM_SECTIONS}
                values={{ measurement }}
                onChange={handleFieldChange}
                fieldValidity={fieldValidity}
                submitAttempted={submitAttempted}
                onValidityChange={handleValidityChange}
            />

            <div className="weight-log-form-submit-row">
                {submitError && <div className="error-message">{submitError}</div>}
                {submitSuccess && <div className="success-message">¡Registro guardado correctamente!</div>}

                <div className="form-buttons">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            disabled={submitting}
                            className="weight-log-form-cancel-button"
                        >
                            <span className="button-text">Cancelar</span>
                        </button>
                    )}
                    <button
                        onClick={onSubmitClick}
                        disabled={submitting}
                        className="weight-log-form-submit-button"
                    >
                        <span className="button-text">{submitting ? 'Guardando...' : 'Guardar registro'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WeightLogForm;

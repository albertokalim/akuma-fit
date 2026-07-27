import { useState } from 'react';
import DynamicForm from '../../components/complex/DynamicForm/DynamicForm.jsx';
import Button from '../../components/primitives/Button/Button.jsx';
import FORM_SECTIONS from '../../config/weightLogFields.json';
import useFormSubmission from '../../hooks/useFormSubmission.js';
import { measurementService } from '../../services/measurementService.js';
import './WeightLog.css';

const ALL_FIELDS = FORM_SECTIONS.flatMap((section) => section.fields);
const FIELD_LABELS_BY_ID = Object.fromEntries(ALL_FIELDS.map((field) => [field.id, field.label]));

function WeightLog({ onComplete }) {
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
        <div className="weight-log">
            <h1 className="weight-log-title">Registro de peso</h1>
            <p className="weight-log-description">Registra tu peso y, si quieres, tus medidas corporales para poder hacer un seguimiento de tu progreso. Solo el peso es obligatorio.</p>

            <DynamicForm
                sections={FORM_SECTIONS}
                values={{ measurement }}
                onChange={handleFieldChange}
                fieldValidity={fieldValidity}
                submitAttempted={submitAttempted}
                onValidityChange={handleValidityChange}
            />

            <div className="weight-log-submit-row">
                {submitError && <div className="error-message">{submitError}</div>}
                {submitSuccess && <div className="success-message">¡Registro guardado correctamente!</div>}

                <Button
                    text={submitting ? 'Guardando...' : 'Guardar registro'}
                    onClick={onSubmitClick}
                    disabled={submitting}
                    className="weight-log-submit-button"
                />
            </div>
        </div>
    );
}

export default WeightLog;

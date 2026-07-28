import { useState } from 'react';
import DynamicForm from '../../components/complex/DynamicForm/DynamicForm.jsx';
import FORM_SECTIONS from '../../config/checkInFields.json';
import useFormSubmission from '../../hooks/useFormSubmission.js';
import { checkInService } from '../../services/checkInService.js';
import './CheckInForm.css';

const ALL_FIELDS = FORM_SECTIONS.flatMap((section) => section.fields);
const FIELD_LABELS_BY_ID = Object.fromEntries(ALL_FIELDS.map((field) => [field.id, field.label]));

function CheckInForm({ onComplete, onCancel }) {
    const [checkIn, setCheckIn] = useState({});

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
        setCheckIn((prev) => ({ ...prev, [key]: value }));
    };

    const onSubmit = async () => {
        await checkInService.create(checkIn);
    };

    const onSubmitClick = () => handleSubmit(onSubmit);

    return (
        <div className="check-in-form">
            <h1 className="check-in-form-title">Check-In</h1>
            <p className="check-in-form-description">Cuéntanos cómo te ha ido esta semana para poder ajustar tu plan de entrenamiento y nutrición.</p>

            <DynamicForm
                sections={FORM_SECTIONS}
                values={{ checkIn }}
                onChange={handleFieldChange}
                fieldValidity={fieldValidity}
                submitAttempted={submitAttempted}
                onValidityChange={handleValidityChange}
            />

            <div className="check-in-form-submit-row">
                {submitError && <div className="error-message">{submitError}</div>}
                {submitSuccess && <div className="success-message">¡Check-in enviado correctamente!</div>}

                <div className="check-in-form-buttons">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            disabled={submitting}
                            className="check-in-form-cancel-button"
                        >
                            <span className="button-text">Cancelar</span>
                        </button>
                    )}
                    <button
                        onClick={onSubmitClick}
                        disabled={submitting}
                        className="check-in-form-submit-button"
                    >
                        <span className="button-text">{submitting ? 'Enviando...' : 'Enviar Check-In'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CheckInForm;

import { useState } from 'react';
import FormField from '../../components/complex/FormField/FormField.jsx';
import FormSection from '../../components/complex/FormSection/FormSection.jsx';
import useFormSubmission from '../../hooks/useFormSubmission.js';
import FORM_SECTIONS from '../../config/profileFields.json';
import { FiLock } from 'react-icons/fi';


const ALL_FIELDS = FORM_SECTIONS.flatMap((section) => section.fields);

const FIELD_LABELS_BY_ID = Object.fromEntries(ALL_FIELDS.map((field) => [field.id, field.label]));

/**
 * Formulario de edición del perfil, construido desde `profileFields.json`.
 *
 * @param {Object} props - Props del componente.
 * @param {Object} [props.initialData] - Datos iniciales del perfil.
 * @param {(data: Object) => void} [props.onSave] - Callback al guardar.
 * @param {() => void} [props.onCancel] - Callback de cancelación.
 */
function ProfileForm({ initialData = {}, onSave, onCancel }) {
    const [profile, setProfile] = useState(() => {
        const initial = {};
        ALL_FIELDS.forEach((field) => {
            initial[field.id] = initialData[field.id] || '';
        });
        return initial;
    });

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
            if (onSave) {
                onSave(profile);
            }
        },
    });

    const groupValues = { profile };
    const groupSetters = { profile: setProfile };

    const handleFieldChange = (group, event) => {
        const { id, value } = event.target;
        groupSetters[group]((prev) => ({ ...prev, [id]: value }));
    };

    const handleSave = async () => {
        await handleSubmit(async () => {
            if (onSave) {
                await onSave(profile);
            }
        });
    };

    const handleChangePassword = () => {
    };

    const renderField = (field) => {
        const value = groupValues[field.group][field.id];
        const onChange = (event) => handleFieldChange(field.group, event);
        const hasError = submitAttempted && fieldValidity[field.id] === false;

        return (
            <FormField
                key={field.id}
                id={field.id}
                label={field.label}
                value={value || ''}
                onChange={onChange}
                placeholder={field.placeholder}
                required={field.required}
                type={field.type || 'text'}
                hasError={hasError}
                onValidityChange={handleValidityChange}
            />
        );
    };

    return (
        <div className="profile-form">
            <h1 className="profile-form-title">Editar perfil</h1>

            {FORM_SECTIONS.map((section) => (
                <FormSection key={section.title} title={section.title}>
                    {section.fields.map(renderField)}
                </FormSection>
            ))}

            <FormSection title="Seguridad">
                <button onClick={handleChangePassword} className="profile-form-password-btn">
                    <span className="button-icon"><FiLock /></span>
                    <span className="button-text">Cambiar contraseña</span>
                </button>
            </FormSection>

            <div className="profile-form-submit-row">
                {submitError && <div className="error-message">{submitError}</div>}
                {submitSuccess && <div className="success-message">Perfil actualizado correctamente.</div>}

                <div className="form-buttons">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            disabled={submitting}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={submitting}
                        className="profile-form-submit-button"
                    >
                        <span className="button-text">{submitting ? 'Guardando...' : 'Guardar cambios'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProfileForm;

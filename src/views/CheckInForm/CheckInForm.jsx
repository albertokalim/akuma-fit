import FormSection from "../../components/complex/FormSection/FormSection.jsx";
import FormField from "../../components/complex/FormField/FormField.jsx";
import {useState} from "react";
import RadioGroupField from "../../components/complex/RadioGroupField/RadioGroupField.jsx";
import CheckboxGroupField from "../../components/complex/CheckboxGroupField/CheckboxGroupField.jsx";
import ScaleField from "../../components/complex/ScaleField/ScaleField.jsx";
import Button from "../../components/primitives/Button/Button.jsx";
import {supabase} from "../../supabaseClient.js";
import FORM_SECTIONS from "../../config/checkInFields.json";
import useFormSubmission from "../../hooks/useFormSubmission.js";
import './CheckInForm.css';

const NUMERIC_CHECKIN_FIELDS = ['hunger_level', 'rest_quality'];

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

    const groupValues = { checkIn };
    const groupSetters = { checkIn: setCheckIn };

    const handleFieldChange = (group, event) => {
        const { id, name, value } = event.target;
        const key = name || id;

        groupSetters[group]((prev) => ({ ...prev, [key]: value }));
    };

    const getProfileId = async (authUser) => {
        const { data: profile, error: profileError } = await supabase
            .from('profile')
            .select('id')
            .eq('user', authUser.id)
            .maybeSingle();

        if (profileError) {
            throw new Error(`No se pudo comprobar el perfil: ${profileError.message}`);
        }

        if (!profile) {
            throw new Error('No se ha encontrado tu perfil. Completa primero la valoración inicial.');
        }

        return profile.id;
    };

    const onSubmit = async () => {
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData?.user) {
            throw new Error('Debes iniciar sesión para enviar el check-in.');
        }

        const profileId = await getProfileId(authData.user);

        const checkInPayload = { ...checkIn, profile_id: profileId };
        NUMERIC_CHECKIN_FIELDS.forEach((field) => {
            checkInPayload[field] = checkInPayload[field] ? Number(checkInPayload[field]) : null;
        });

        const { error: checkInError } = await supabase.from('check_in').insert(checkInPayload);
        if (checkInError) {
            throw new Error(`No se pudo guardar el check-in: ${checkInError.message}`);
        }
    };

    const onSubmitClick = () => handleSubmit(onSubmit);

    const renderField = (field) => {
        const value = groupValues[field.group][field.id];
        const onChange = (event) => handleFieldChange(field.group, event);
        const hasError = submitAttempted && fieldValidity[field.id] === false;

        switch (field.component) {
            case 'radio':
                return (
                    <RadioGroupField
                        key={field.id}
                        id={field.id}
                        label={field.label}
                        required={field.required}
                        value={value || ''}
                        onChange={onChange}
                        options={field.options}
                        hasError={hasError}
                        onValidityChange={handleValidityChange}
                    />
                );
            case 'checkbox':
                return (
                    <CheckboxGroupField
                        key={field.id}
                        multiple={false}
                        id={field.id}
                        label={field.label}
                        required={field.required}
                        value={value || ''}
                        onChange={onChange}
                        options={field.options}
                        hasError={hasError}
                        onValidityChange={handleValidityChange}
                    />
                );
            case 'scale':
                return (
                    <ScaleField
                        key={field.id}
                        id={field.id}
                        label={field.label}
                        required={field.required}
                        value={value || ''}
                        onChange={onChange}
                        leftLabel={field.leftLabel}
                        rightLabel={field.rightLabel}
                        min={field.min}
                        max={field.max}
                        hasError={hasError}
                        onValidityChange={handleValidityChange}
                    />
                );
            case 'text':
            default:
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
                        step={field.step}
                        hasError={hasError}
                        onValidityChange={handleValidityChange}
                    />
                );
        }
    };

    return (
        <div className="check-in-form">
            <h1 className="check-in-form-title">Check-In</h1>
            <p className="check-in-form-description">Cuéntanos cómo te ha ido esta semana para poder ajustar tu plan de entrenamiento y nutrición.</p>

            {FORM_SECTIONS.map((section) => (
                <FormSection key={section.title} title={section.title}>
                    {section.fields.map(renderField)}
                </FormSection>
            ))}

            <div className="check-in-form-submit-row">
                {submitError && <div className="error-message">{submitError}</div>}
                {submitSuccess && <div className="success-message">¡Check-in enviado correctamente!</div>}

                <div className="check-in-form-buttons">
                    {onCancel && (
                        <Button
                            text="Cancelar"
                            onClick={onCancel}
                            disabled={submitting}
                            className="check-in-form-cancel-button"
                        />
                    )}
                    <Button
                        text={submitting ? 'Enviando...' : 'Enviar Check-In'}
                        onClick={onSubmitClick}
                        disabled={submitting}
                        className="check-in-form-submit-button"
                    />
                </div>
            </div>
        </div>
    );
}

export default CheckInForm;
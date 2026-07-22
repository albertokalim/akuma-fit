import FormSection from "../../components/complex/FormSection/FormSection.jsx";
import FormField from "../../components/complex/FormField/FormField.jsx";
import {useState} from "react";
import RadioGroupField from "../../components/complex/RadioGroupField/RadioGroupField.jsx";
import CheckboxGroupField from "../../components/complex/CheckboxGroupField/CheckboxGroupField.jsx";
import ScaleField from "../../components/complex/ScaleField/ScaleField.jsx";
import Button from "../../components/primitives/Button/Button.jsx";
import {supabase} from "../../supabaseClient.js";
import FORM_SECTIONS from "../../config/weightLogFields.json";
import useFormSubmission from "../../hooks/useFormSubmission.js";
import './WeightLogForm.css';

const NUMERIC_MEASUREMENT_FIELDS = ['weight', 'chest', 'waist', 'hip'];

const ALL_FIELDS = FORM_SECTIONS.flatMap((section) => section.fields);

const FIELD_LABELS_BY_ID = Object.fromEntries(ALL_FIELDS.map((field) => [field.id, field.label]));

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

    const groupValues = { measurement };
    const groupSetters = { measurement: setMeasurement };

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
            throw new Error('Debes iniciar sesión para enviar el registro de peso.');
        }

        const profileId = await getProfileId(authData.user);

        const measurementPayload = { ...measurement, profile_id: profileId };
        NUMERIC_MEASUREMENT_FIELDS.forEach((field) => {
            measurementPayload[field] = measurementPayload[field] ? Number(measurementPayload[field]) : null;
        });

        const { error: measurementError } = await supabase.from('measurement').insert(measurementPayload);
        if (measurementError) {
            throw new Error(`No se pudo guardar el registro de peso: ${measurementError.message}`);
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
        <div className="weight-log-form">
            <h1 className="weight-log-form-title">Registro de peso</h1>
            <p className="weight-log-form-description">Registra tu peso y, si quieres, tus medidas corporales para poder hacer un seguimiento de tu progreso. Solo el peso es obligatorio.</p>

            {FORM_SECTIONS.map((section) => (
                <FormSection key={section.title} title={section.title}>
                    {section.fields.map(renderField)}
                </FormSection>
            ))}

            <div className="weight-log-form-submit-row">
                {submitError && <div className="error-message">{submitError}</div>}
                {submitSuccess && <div className="success-message">¡Registro guardado correctamente!</div>}

                <div className="weight-log-form-buttons">
                    {onCancel && (
                        <Button
                            text="Cancelar"
                            onClick={onCancel}
                            disabled={submitting}
                            className="weight-log-form-cancel-button"
                        />
                    )}
                    <Button
                        text={submitting ? 'Guardando...' : 'Guardar registro'}
                        onClick={onSubmitClick}
                        disabled={submitting}
                        className="weight-log-form-submit-button"
                    />
                </div>
            </div>
        </div>
    );
}

export default WeightLogForm;
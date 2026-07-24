import FormSection from "../../components/complex/FormSection/FormSection.jsx";
import FormField from "../../components/complex/FormField/FormField.jsx";
import {useState} from "react";
import RadioGroupField from "../../components/complex/RadioGroupField/RadioGroupField.jsx";
import CheckboxGroupField from "../../components/complex/CheckboxGroupField/CheckboxGroupField.jsx";
import ScaleField from "../../components/complex/ScaleField/ScaleField.jsx";
import BooleanCheckboxField from "../../components/complex/BooleanCheckboxField/BooleanCheckboxField.jsx";
import Button from "../../components/primitives/Button/Button.jsx";
import BodyPhotoCapture from "../../components/complex/BodyPhotoCapture/BodyPhotoCapture.jsx";
import {supabase} from "../../supabaseClient.js";
import FORM_SECTIONS from "../../config/initialAssessmentFields.json";
import useFormSubmission from "../../hooks/useFormSubmission.js";
import './InitialAssessment.css';

// Campos de initialAssessment que se guardan como número (int2) en Supabase
const NUMERIC_ASSESSMENT_FIELDS = ['height', 'motivation_level', 'current_stress_level', 'expected_adherence'];

// El registro de campos del formulario (título de sección, id, grupo de estado, tipo de
// control, si es required, opciones, etc.) vive en src/config/initialAssessmentFields.json,
// como única fuente de verdad para renderizado y validación.

// Aplana todos los campos de todas las secciones para poder iterarlos fácilmente.
const ALL_FIELDS = FORM_SECTIONS.flatMap((section) => section.fields);

// Mapa id -> label, usado únicamente para componer el mensaje de error (no para validar:
// la validación la hace cada componente por sí mismo y la reporta al padre).
const FIELD_LABELS_BY_ID = Object.fromEntries(ALL_FIELDS.map((field) => [field.id, field.label]));

function InitialAssessment({ onComplete }) {
    const [initialAssessment, setInitialAssessment] = useState({});
    const [measurement, setMeasurement] = useState({});
    const [userInfo, setUserInfo] = useState({});
    const [showPhotoCapture, setShowPhotoCapture] = useState(false);
    const formatResults = (results) => JSON.stringify(results, null, 2);

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
        onSuccess: () => setShowPhotoCapture(true),
    });

    // Valores y setters de cada estado, indexados por el nombre de "group" usado en FORM_SECTIONS.
    const groupValues = { userInfo, measurement, initialAssessment };
    const groupSetters = { userInfo: setUserInfo, measurement: setMeasurement, initialAssessment: setInitialAssessment };

    const handleFieldChange = (group, event) => {
        const { id, name, value } = event.target;
        const key = name || id;

        groupSetters[group]((prev) => ({ ...prev, [key]: value }));
    };

    const getOrCreateProfile = async (authUser) => {
        // Buscamos si el usuario ya tiene un profile creado
        const { data: existingProfile, error: fetchError } = await supabase
            .from('profile')
            .select('id')
            .eq('user', authUser.id)
            .maybeSingle();

        if (fetchError) {
            throw new Error(`No se pudo comprobar el perfil existente: ${fetchError.message}`);
        }

        if (existingProfile) {
            return existingProfile.id;
        }

        // Si no existe, lo creamos con los datos del formulario
        const { data: newProfile, error: insertError } = await supabase
            .from('profile')
            .insert({
                user: authUser.id,
                name: userInfo.name || null,
                surname: userInfo.surname || null,
                birthdate: userInfo.birthdate || null,
                gender: userInfo.gender || null,
                role: 'client',
            })
            .select('id')
            .single();

        if (insertError) {
            throw new Error(`No se pudo crear el perfil: ${insertError.message}`);
        }

        return newProfile.id;
    };

    const onSubmit = async () => {
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData?.user) {
            throw new Error('Debes iniciar sesión para enviar la valoración inicial.');
        }

        const clientId = await getOrCreateProfile(authData.user);

        const { data: existingAssessment, error: existingAssessmentError } = await supabase
            .from('initial_assessment')
            .select('id')
            .eq('profile_id', clientId)
            .maybeSingle();

        if (existingAssessmentError) {
            throw new Error(`No se pudo comprobar si ya existía una valoración: ${existingAssessmentError.message}`);
        }

        if (existingAssessment) {
            throw new Error('Ya has completado tu valoración inicial anteriormente.');
        }

        const measurementPayload = {
            profile_id: clientId,
            weight: measurement.weight ? Number(measurement.weight) : null,
        };

        const assessmentPayload = { ...initialAssessment, profile_id: clientId };
        NUMERIC_ASSESSMENT_FIELDS.forEach((field) => {
            assessmentPayload[field] = assessmentPayload[field] ? Number(assessmentPayload[field]) : null;
        });

        console.log('Enviando a Supabase:', formatResults({ measurementPayload, assessmentPayload }));

        const { error: measurementError } = await supabase.from('measurement').insert(measurementPayload);
        if (measurementError) {
            throw new Error(`No se pudo guardar la medición: ${measurementError.message}`);
        }

        const { error: assessmentError } = await supabase.from('initial_assessment').insert(assessmentPayload);
        if (assessmentError) {
            throw new Error(`No se pudo guardar la valoración inicial: ${assessmentError.message}`);
        }
    };

    const onSubmitClick = () => handleSubmit(onSubmit);

    const handleSkipPhotos = () => {
        if (onComplete) {
            setTimeout(() => onComplete(), 0);
        }
    };

    const renderField = (field) => {
        const value = groupValues[field.group][field.id];
        const onChange = (event) => handleFieldChange(field.group, event);
        // Solo mostramos el error visual si ya se intentó enviar y el propio campo
        // ha reportado que no es válido.
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
                        value={value || field.defaultValue}
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
            case 'boolean-checkbox':
                return (
                    <BooleanCheckboxField
                        key={field.id}
                        id={field.id}
                        label={field.label}
                        required={field.required}
                        value={value === true}
                        onChange={onChange}
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

    if (showPhotoCapture) {
        return (
            <div className="initial-assessment">
                <h1 className="initial-assessment-title">¡Valoración completada!</h1>
                <p className="initial-assessment-description">
                    Tu valoración inicial se ha guardado correctamente. ¿Te gustaría tomar fotos corporales ahora para tener un registro visual de tu punto de partida?
                </p>
                
                <BodyPhotoCapture />
                
                <div className="initial-assessment-submit-row">
                    <div className="photo-capture-actions">
                        <Button
                            text="Saltar por ahora"
                            onClick={handleSkipPhotos}
                            className="skip-photos-button"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="initial-assessment">
            <h1 className="initial-assessment-title">Valoración inicial - entrenamiento y nutrición</h1>
            <p className="initial-assessment-description">Este cuestionario sirve para realizar una valoración inicial antes de diseñar un plan de entrenamiento y nutrición. La información permitirá adaptar el programa a tu objetivo, nivel, disponibilidad, salud, lesiones, estilo de vida y preferencias. Responde con la mayor sinceridad posible.</p>

            {FORM_SECTIONS.map((section) => (
                <FormSection key={section.title} title={section.title}>
                    {section.fields.map(renderField)}
                </FormSection>
            ))}

            <div className="initial-assessment-submit-row">
                {submitError && <div className="error-message">{submitError}</div>}
                {submitSuccess && <div className="success-message">¡Valoración inicial enviada correctamente!</div>}

                <Button
                    text={submitting ? 'Enviando...' : 'Enviar'}
                    onClick={onSubmitClick}
                    disabled={submitting}
                    className="initial-assessment-submit-button"
                />
            </div>
        </div>
    );
}

export default InitialAssessment;

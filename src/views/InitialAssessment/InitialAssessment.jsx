import FormSection from "../../components/complex/FormSection/FormSection.jsx";
import FormField from "../../components/complex/FormField/FormField.jsx";
import {useState, useRef, useCallback} from "react";
import RadioGroupField from "../../components/complex/RadioGroupField/RadioGroupField.jsx";
import CheckboxGroupField from "../../components/complex/CheckboxGroupField/CheckboxGroupField.jsx";
import ScaleField from "../../components/complex/ScaleField/ScaleField.jsx";
import Button from "../../components/primitives/Button/Button.jsx";
import {supabase} from "../../supabaseClient.js";
import FORM_SECTIONS from "../../config/initialAssessmentFields.json";
import './InitialAssessment.css';

// Campos de initialAssessment que se guardan como número (int2) en Supabase
const NUMERIC_ASSESSMENT_FIELDS = ['motivation_level', 'current_stress_level', 'expected_adherence'];

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
    // Mapa id -> boolean, alimentado por cada campo a través de onValidityChange.
    // El padre no sabe (ni necesita saber) qué hace válido o inválido a cada campo:
    // simplemente pregunta a cada componente y agrega el resultado.
    const [fieldValidity, setFieldValidity] = useState({});
    // Solo mostramos los errores visuales tras el primer intento de envío.
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const isSubmittingRef = useRef(false);
    const formatResults = (results) => JSON.stringify(results, null, 2);

    // Valores y setters de cada estado, indexados por el nombre de "group" usado en FORM_SECTIONS.
    const groupValues = { userInfo, measurement, initialAssessment };
    const groupSetters = { userInfo: setUserInfo, measurement: setMeasurement, initialAssessment: setInitialAssessment };

    const handleFieldChange = (group, event) => {
        const { id, name, value } = event.target;
        const key = name || id;

        groupSetters[group]((prev) => ({ ...prev, [key]: value }));
    };

    // Callback estable que cada campo invoca para reportar su propia validez.
    // Si el valor no cambia respecto al que ya teníamos, no se genera un nuevo objeto
    // de estado, evitando renders innecesarios.
    const handleValidityChange = useCallback((id, isValid) => {
        setFieldValidity((prev) => (prev[id] === isValid ? prev : { ...prev, [id]: isValid }));
    }, []);

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

    const handleSubmit = async () => {
        // Evita envíos duplicados por doble click mientras la petición está en curso
        if (isSubmittingRef.current) {
            return;
        }

        setSubmitError('');
        setSubmitSuccess(false);
        setSubmitAttempted(true);

        // Validación genérica: cada campo ya nos ha dicho si es válido o no a través de
        // onValidityChange. Aquí solo preguntamos al mapa resultante, sin importar
        // cuántos campos haya ni qué los haga inválidos.
        const invalidFieldIds = Object.entries(fieldValidity)
            .filter(([, isValid]) => !isValid)
            .map(([id]) => id);

        if (invalidFieldIds.length > 0) {
            const invalidLabels = invalidFieldIds.map((id) => FIELD_LABELS_BY_ID[id] || id);
            setSubmitError(
                invalidLabels.length === 1
                    ? `Falta por completar el campo obligatorio: "${invalidLabels[0]}".`
                    : `Faltan ${invalidLabels.length} campos obligatorios por completar: ${invalidLabels.map((l) => `"${l}"`).join(', ')}.`
            );
            return;
        }

        isSubmittingRef.current = true;
        setSubmitting(true);

        try {
            const { data: authData, error: authError } = await supabase.auth.getUser();

            if (authError || !authData?.user) {
                throw new Error('Debes iniciar sesión para enviar la valoración inicial.');
            }

            const clientId = await getOrCreateProfile(authData.user);

            // Evita duplicar filas si el usuario ya había completado la valoración
            // (p. ej. reintentos tras un error, doble envío, refrescos, etc.)
            const { data: existingAssessment, error: existingAssessmentError } = await supabase
                .from('initial_assessment')
                .select('id')
                .eq('client', clientId)
                .maybeSingle();

            if (existingAssessmentError) {
                throw new Error(`No se pudo comprobar si ya existía una valoración: ${existingAssessmentError.message}`);
            }

            if (existingAssessment) {
                throw new Error('Ya has completado tu valoración inicial anteriormente.');
            }

            const measurementPayload = {
                client: clientId,
                weight: measurement.weight ? Number(measurement.weight) : null,
                height: measurement.height ? Number(measurement.height) : null,
            };

            const assessmentPayload = { ...initialAssessment, client: clientId };
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

            setSubmitSuccess(true);

            if (onComplete) {
                // Pequeña pausa para que el usuario vea el mensaje de éxito antes de navegar
                setTimeout(() => onComplete(), 1200);
            }
        } catch (exception) {
            setSubmitError(exception.message);
        } finally {
            setSubmitting(false);
            isSubmittingRef.current = false;
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
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="initial-assessment-submit-button"
                />
            </div>
        </div>
    );
}

export default InitialAssessment;

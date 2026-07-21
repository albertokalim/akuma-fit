import FormSection from "../../components/complex/FormSection/FormSection.jsx";
import FormField from "../../components/complex/FormField/FormField.jsx";
import {useState, useRef, useCallback} from "react";
import RadioGroupField from "../../components/complex/RadioGroupField/RadioGroupField.jsx";
import CheckboxGroupField from "../../components/complex/CheckboxGroupField/CheckboxGroupField.jsx";
import ScaleField from "../../components/complex/ScaleField/ScaleField.jsx";
import Button from "../../components/primitives/Button/Button.jsx";
import {supabase} from "../../supabaseClient.js";
import FORM_SECTIONS from "../../config/weightLogFields.json";
import './WeightLog.css';

// Campos de measurements que se guardan como número en Supabase (peso + perímetros corporales)
const NUMERIC_MEASUREMENTS_FIELDS = ['weight', 'chest', 'waist', 'hip'];

// El registro de campos del formulario (título de sección, id, grupo de estado, tipo de
// control, si es required, opciones, etc.) vive en src/config/weightLogFields.json,
// como única fuente de verdad para renderizado y validación.

// Aplana todos los campos de todas las secciones para poder iterarlos fácilmente.
const ALL_FIELDS = FORM_SECTIONS.flatMap((section) => section.fields);

// Mapa id -> label, usado únicamente para componer el mensaje de error (no para validar:
// la validación la hace cada componente por sí mismo y la reporta al padre).
const FIELD_LABELS_BY_ID = Object.fromEntries(ALL_FIELDS.map((field) => [field.id, field.label]));

function WeightLog({ onComplete }) {
    const [measurements, setMeasurements] = useState({});
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

    // Valores y setters de cada estado, indexados por el nombre de "group" usado en FORM_SECTIONS.
    const groupValues = { measurements };
    const groupSetters = { measurements: setMeasurements };

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

    const getClientId = async (authUser) => {
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
                throw new Error('Debes iniciar sesión para enviar el registro de peso.');
            }

            const clientId = await getClientId(authData.user);

            const measurementsPayload = { ...measurements, client: clientId };
            NUMERIC_MEASUREMENTS_FIELDS.forEach((field) => {
                measurementsPayload[field] = measurementsPayload[field] ? Number(measurementsPayload[field]) : null;
            });

            const { error: measurementsError } = await supabase.from('measurements').insert(measurementsPayload);
            if (measurementsError) {
                throw new Error(`No se pudo guardar el registro de peso: ${measurementsError.message}`);
            }

            setSubmitSuccess(true);
            setMeasurements({});
            setFieldValidity({});
            setSubmitAttempted(false);

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
        <div className="weight-log">
            <h1 className="weight-log-title">Registro de peso</h1>
            <p className="weight-log-description">Registra tu peso y, si quieres, tus medidas corporales para poder hacer un seguimiento de tu progreso. Solo el peso es obligatorio.</p>

            {FORM_SECTIONS.map((section) => (
                <FormSection key={section.title} title={section.title}>
                    {section.fields.map(renderField)}
                </FormSection>
            ))}

            <div className="weight-log-submit-row">
                {submitError && <div className="error-message">{submitError}</div>}
                {submitSuccess && <div className="success-message">¡Registro guardado correctamente!</div>}

                <Button
                    text={submitting ? 'Guardando...' : 'Guardar registro'}
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="weight-log-submit-button"
                />
            </div>
        </div>
    );
}

export default WeightLog;

import FormSection from "../../components/complex/FormSection/FormSection.jsx";
import FormField from "../../components/complex/FormField/FormField.jsx";
import {useState, useRef, useCallback} from "react";
import RadioGroupField from "../../components/complex/RadioGroupField/RadioGroupField.jsx";
import CheckboxGroupField from "../../components/complex/CheckboxGroupField/CheckboxGroupField.jsx";
import ScaleField from "../../components/complex/ScaleField/ScaleField.jsx";
import Button from "../../components/primitives/Button/Button.jsx";
import {supabase} from "../../supabaseClient.js";
import FORM_SECTIONS from "../../config/checkInFields.json";
import './CheckIn.css';

// Campos de checkIn que se guardan como número (int2) en Supabase
const NUMERIC_CHECKIN_FIELDS = ['diet_adherence', 'training_adherence', 'hunger_level', 'rest_quality'];

// El registro de campos del formulario (título de sección, id, grupo de estado, tipo de
// control, si es required, opciones, etc.) vive en src/config/checkInFields.json,
// como única fuente de verdad para renderizado y validación.

// Aplana todos los campos de todas las secciones para poder iterarlos fácilmente.
const ALL_FIELDS = FORM_SECTIONS.flatMap((section) => section.fields);

// Mapa id -> label, usado únicamente para componer el mensaje de error (no para validar:
// la validación la hace cada componente por sí mismo y la reporta al padre).
const FIELD_LABELS_BY_ID = Object.fromEntries(ALL_FIELDS.map((field) => [field.id, field.label]));

function CheckIn({ onComplete }) {
    const [checkIn, setCheckIn] = useState({});
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
    const groupValues = { checkIn };
    const groupSetters = { checkIn: setCheckIn };

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
                throw new Error('Debes iniciar sesión para enviar el check-in.');
            }

            const clientId = await getClientId(authData.user);

            const checkInPayload = { ...checkIn, client: clientId };
            NUMERIC_CHECKIN_FIELDS.forEach((field) => {
                checkInPayload[field] = checkInPayload[field] ? Number(checkInPayload[field]) : null;
            });

            const { error: checkInError } = await supabase.from('check_in').insert(checkInPayload);
            if (checkInError) {
                throw new Error(`No se pudo guardar el check-in: ${checkInError.message}`);
            }

            setSubmitSuccess(true);
            setCheckIn({});
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
        <div className="check-in">
            <h1 className="check-in-title">Check-In</h1>
            <p className="check-in-description">Cuéntanos cómo te ha ido esta semana para poder ajustar tu plan de entrenamiento y nutrición.</p>

            {FORM_SECTIONS.map((section) => (
                <FormSection key={section.title} title={section.title}>
                    {section.fields.map(renderField)}
                </FormSection>
            ))}

            <div className="check-in-submit-row">
                {submitError && <div className="error-message">{submitError}</div>}
                {submitSuccess && <div className="success-message">¡Check-in enviado correctamente!</div>}

                <Button
                    text={submitting ? 'Enviando...' : 'Enviar Check-In'}
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="check-in-submit-button"
                />
            </div>
        </div>
    );
}

export default CheckIn;

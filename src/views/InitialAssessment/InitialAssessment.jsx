import FormSection from "../../components/complex/FormSection/FormSection.jsx";
import FormField from "../../components/complex/FormField/FormField.jsx";
import {useState, useRef} from "react";
import RadioGroupField from "../../components/complex/RadioGroupField/RadioGroupField.jsx";
import CheckboxGroupField from "../../components/complex/CheckboxGroupField/CheckboxGroupField.jsx";
import ScaleField from "../../components/complex/ScaleField/ScaleField.jsx";
import Button from "../../components/primitives/Button/Button.jsx";
import {supabase} from "../../supabaseClient.js";
import './InitialAssessment.css';

// Campos de initialAssessment que se guardan como número (int2) en Supabase
const NUMERIC_ASSESSMENT_FIELDS = ['motivation_level', 'current_stress_level', 'expected_adherence'];

function InitialAssessment({ onComplete }) {
    const [initialAssessment, setInitialAssessment] = useState({});
    const [measurement, setMeasurement] = useState({});
    const [userInfo, setUserInfo] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const isSubmittingRef = useRef(false);
    const formatResults = (results) => JSON.stringify(results, null, 2);

    const handleUserInfoChange = (event) => {
        const { id, name, value } = event.target;
        const key = name || id;

        setUserInfo((prev) => ({ ...prev, [key]: value }));
    };

    const handleMeasurementChange = (event) => {
        const { id, name, value } = event.target;
        const key = name || id;

        setMeasurement((prev) => ({ ...prev, [key]: value }));
    };

    const handleInitialAssessmentChange = (event) => {
        const { id, name, value } = event.target;
        const key = name || id;

        setInitialAssessment((prev) => ({ ...prev, [key]: value }));
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

    const handleSubmit = async () => {
        // Evita envíos duplicados por doble click mientras la petición está en curso
        if (isSubmittingRef.current) {
            return;
        }
        isSubmittingRef.current = true;

        setSubmitError('');
        setSubmitSuccess(false);
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

    return (
        <div className="initial-assessment">
            <h1 className="initial-assessment-title">Valoración inicial - entrenamiento y nutrición</h1>
            <p className="initial-assessment-description">Este cuestionario sirve para realizar una valoración inicial antes de diseñar un plan de entrenamiento y nutrición. La información permitirá adaptar el programa a tu objetivo, nivel, disponibilidad, salud, lesiones, estilo de vida y preferencias. Responde con la mayor sinceridad posible.</p>

            <FormSection title='Datos personales'>
                <FormField
                    label='Nombre'
                    value={userInfo.name || ''}
                    id='name'
                    onChange={handleUserInfoChange}
                    placeholder='Tu nombre'
                    required={true}
                />
                <FormField
                    label='Apellidos'
                    value={userInfo.surname || ''}
                    id='surname'
                    onChange={handleUserInfoChange}
                    placeholder='Tus apellidos'
                    required={true}
                />
                <FormField
                    label='Fecha de nacimiento'
                    value={userInfo.birthdate || ''}
                    id='birthdate'
                    onChange={handleUserInfoChange}
                    placeholder='Fecha de nacimiento'
                    required={true}
                    type='date'
                />
                <RadioGroupField
                    onChange={handleUserInfoChange}
                    id='gender'
                    label='Sexo'
                    required={true}
                    value={userInfo.gender || ''}
                    options={[
                        { label: 'Hombre', value: 'Hombre' },
                        { label: 'Mujer', value: 'Mujer' },
                        { label: 'Prefiero no decirlo', value: 'Prefiero no decirlo' },
                    ]}
                />
                <FormField
                    label='Peso actual en kg'
                    value={measurement.weight || ''}
                    id='weight'
                    onChange={handleMeasurementChange}
                    placeholder='Peso en kg'
                    required={true}
                    type='number'
                />
                <FormField
                    label='Altura en cm'
                    value={measurement.height || ''}
                    id='height'
                    onChange={handleMeasurementChange}
                    placeholder='Altura en cm'
                    required={true}
                    type='number'
                    step='any'
                />
                <FormField
                    label='Teléfono de contacto'
                    value={userInfo.phone || ''}
                    id='phone'
                    onChange={handleUserInfoChange}
                    placeholder='Número de teléfono'
                    required={true}
                    type='tel'
                />
            </FormSection>
            <FormSection title='Objetivo y motivación'>
                <CheckboxGroupField
                    multiple={false}
                    id='goals'
                    label='¿Cuál es tu objetivo principal?'
                    required={true}
                    value={initialAssessment.goals || ''}
                    onChange={handleInitialAssessmentChange}
                    options={[
                        { label: 'Salud', value: 'Salud' },
                        { label: 'Pérdida de grasa', value: 'Pérdida de grasa' },
                        { label: 'Hipertrofia / ganar masa muscular', value: 'Hipertrofia / ganar masa muscular' },
                        { label: 'Fuerza', value: 'Fuerza' },
                        { label: 'Definición', value: 'Definición' },
                        { label: 'Rendimiento deportivo', value: 'Rendimiento deportivo' },
                        { label: 'Reacondicionamiento tras parón o lesión', value: 'Reacondicionamiento tras parón o lesión' },
                    ]}
                />
                <FormField
                    label='¿En qué plazo te gustaría conseguirlo? Ejemplo: 3 meses, 6 meses, 1 año'
                    value={initialAssessment.deadline || ''}
                    id='deadline'
                    onChange={handleInitialAssessmentChange}
                    placeholder=''
                    required={true}
                    type='text'
                />
                <ScaleField
                    required={true}
                    id='motivation_level'
                    onChange={handleInitialAssessmentChange}
                    label='Nivel de motivación actual'
                    value={initialAssessment.motivation_level || ''}
                    leftLabel='muy baja'
                    rightLabel='muy alta'
                    max={10}
                    min={1}
                />
                <FormField
                    label='¿Qué has intentado antes y qué resultado tuviste?'
                    value={initialAssessment.past || ''}
                    id='past'
                    onChange={handleInitialAssessmentChange}
                    placeholder=''
                    required={true}
                    type='text'
                />
            </FormSection>
            <FormSection title='Disponibilidad y preferencias'>
                <CheckboxGroupField
                    multiple={false}
                    id='current_level'
                    label='Nivel actual'
                    required={true}
                    value={initialAssessment.current_level || ''}
                    onChange={handleInitialAssessmentChange}
                    options={[
                        { label: 'Sedentario/a', value: 'Sedentario/a' },
                        { label: 'Vuelvo tras mucho tiempo sin entrenar', value: 'Vuelvo tras mucho tiempo sin entrenar' },
                        { label: 'Principiante', value: 'Principiante' },
                        { label: 'Intermedio', value: 'Intermedio' },
                        { label: 'Avanzado', value: 'Avanzado' }
                    ]}
                />
                <CheckboxGroupField
                    multiple={false}
                    id='training_freq'
                    label='¿Cuántos días puedes entrenar por semana?'
                    required={true}
                    value={initialAssessment.training_freq || ''}
                    onChange={handleInitialAssessmentChange}
                    options={[
                        { label: '1 día', value: '1 día' },
                        { label: '2 días', value: '2 días' },
                        { label: '3 días', value: '3 días' },
                        { label: '4 días', value: '4 días' },
                        { label: '5 días', value: '5 días' },
                        { label: '6 días', value: '6 días' }
                    ]}
                />
                <CheckboxGroupField
                    multiple={false}
                    id='time_per_session'
                    label='¿Cuánto tiempo tienes por sesión?'
                    required={true}
                    value={initialAssessment.time_per_session || ''}
                    onChange={handleInitialAssessmentChange}
                    options={[
                        { label: 'Menos de 30 minutos', value: 'Menos de 30 minutos' },
                        { label: '30-45 minutos', value: '30-45 minutos' },
                        { label: '45-60 minutos', value: '45-60 minutos' },
                        { label: 'Más de 60 minutos', value: 'Más de 60 minutos' }
                    ]}
                />
                <CheckboxGroupField
                    multiple={false}
                    id='where'
                    label='¿Dónde entrenarás?'
                    required={true}
                    value={initialAssessment.where || ''}
                    onChange={handleInitialAssessmentChange}
                    options={[
                        { label: 'Gimnasio', value: 'Gimnasio' },
                        { label: 'Casa', value: 'Casa' },
                        { label: 'Exterior', value: 'Exterior' },
                        { label: 'Otro', value: 'Otro' }
                    ]}
                />
                <CheckboxGroupField
                    multiple={false}
                    id='equipment'
                    label='Material disponible'
                    required={true}
                    value={initialAssessment.equipment || ''}
                    onChange={handleInitialAssessmentChange}
                    options={[
                        { label: 'Gimnasio completo', value: 'Gimnasio completo' },
                        { label: 'Máquina', value: 'Máquina' },
                        { label: 'Mancuernas', value: 'Mancuernas' },
                        { label: 'Barra y discos', value: 'Barra y discos' },
                        { label: 'Bandas elásticas', value: 'Bandas elásticas' },
                        { label: 'Peso corporal', value: 'Peso corporal' },
                        { label: 'Ninguno', value: 'Ninguno' },
                    ]}
                />
            </FormSection>
            <FormSection title='Salud y lesiones'>
                <FormField
                    label='¿Tienes alguna patología, enfermedad o condición médica relevante?'
                    value={initialAssessment.disease || ''}
                    id='disease'
                    onChange={handleInitialAssessmentChange}
                    placeholder=''
                    required={true}
                    type='text'
                />
                <FormField
                    label='¿Tomas medicación actualmente?'
                    value={initialAssessment.medication || ''}
                    id='medication'
                    onChange={handleInitialAssessmentChange}
                    placeholder=''
                    required={true}
                    type='text'
                />
                <FormField
                    label='¿Tienes lesiones actuales o dolor? Si es que sí, indica zona, intensidad 0-10 y cuándo aparece el dolor'
                    value={initialAssessment.current_injuries || ''}
                    id='current_injuries'
                    onChange={handleInitialAssessmentChange}
                    placeholder=''
                    required={true}
                    type='text'
                />
                <FormField
                    label='¿Tienes lesiones previas, cirugías, hernias o restricciones médicas?'
                    value={initialAssessment.medical_restrictions || ''}
                    id='medical_restrictions'
                    onChange={handleInitialAssessmentChange}
                    placeholder=''
                    required={true}
                    type='text'
                />
            </FormSection>
            <FormSection title='Estilo de vida'>
                <CheckboxGroupField
                    multiple={false}
                    id='daily_activity'
                    label='Nivel de actividad diaria'
                    required={true}
                    value={initialAssessment.daily_activity || ''}
                    onChange={handleInitialAssessmentChange}
                    options={[
                        { label: 'Muy bajo (- de 5.000 pasos)', value: 'Muy bajo (- de 5.000 pasos)' },
                        { label: 'Bajo', value: 'Bajo' },
                        { label: 'Medio (+ de 5.000 pasos)', value: 'Medio (+ de 5.000 pasos)' },
                        { label: 'Alto', value: 'Alto' },
                        { label: 'Muy alto (+ de 15.000 pasos)', value: 'Muy alto (+ de 15.000 pasos)' }
                    ]}
                />
                <CheckboxGroupField
                    multiple={false}
                    id='sleep_time'
                    label='Horas de sueño por noche'
                    required={true}
                    value={initialAssessment.sleep_time || ''}
                    onChange={handleInitialAssessmentChange}
                    options={[
                        { label: 'Menos de 5 h', value: 'Menos de 5 h' },
                        { label: '5-6 h', value: '5-6 h' },
                        { label: '6-7 h', value: '6-7 h' },
                        { label: '7-8 h', value: '7-8 h' },
                        { label: 'Más de 8 h', value: 'Más de 8 h' }
                    ]}
                />
                <ScaleField
                    required={true}
                    value={initialAssessment.current_stress_level}
                    id='current_stress_level'
                    onChange={handleInitialAssessmentChange}
                    label='Nivel de estrés actual'
                    max={10}
                    min={1}
                />
            </FormSection>
            <FormSection title='Nutrición'>
                <FormField
                    label='Describe un día normal de alimentación'
                    value={initialAssessment.current_diet || ''}
                    id='current_diet'
                    onChange={handleInitialAssessmentChange}
                    placeholder=''
                    required={true}
                    type='text'
                />
                <FormField
                    label='¿Tienes alergias, intolerancias, restricciones o alimentos que no quieras comer?'
                    value={initialAssessment.food_restrictions || ''}
                    id='food_restrictions'
                    onChange={handleInitialAssessmentChange}
                    placeholder=''
                    required={true}
                    type='text'
                />
                <CheckboxGroupField
                    multiple={false}
                    id='water'
                    label='Consumo de agua diario aproximado'
                    required={true}
                    value={initialAssessment.water || ''}
                    onChange={handleInitialAssessmentChange}
                    options={[
                        { label: 'Menos de 1 litro', value: 'Menos de 1 litro' },
                        { label: '1-2 litros', value: '1-2 litros' },
                        { label: '2-3 litros', value: '2-3 litros' },
                        { label: 'Más de 3 litros', value: 'Más de 3 litros' }
                    ]}
                />
                <ScaleField
                    required={true}
                    value={initialAssessment.expected_adherence}
                    id='expected_adherence'
                    onChange={handleInitialAssessmentChange}
                    label='Adherencia prevista al plan'
                    max={10}
                    min={1}
                />
            </FormSection>

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
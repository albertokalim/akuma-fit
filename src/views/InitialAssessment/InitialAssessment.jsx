import { useState } from 'react';
import DynamicForm from '../../components/complex/DynamicForm/DynamicForm.jsx';
import Button from '../../components/primitives/Button/Button.jsx';
import BodyPhotoCapture from '../../components/complex/BodyPhotoCapture/BodyPhotoCapture.jsx';
import FORM_SECTIONS from '../../config/initialAssessmentFields.json';
import useFormSubmission from '../../hooks/useFormSubmission.js';
import { profileService } from '../../services/profileService.js';
import { measurementService } from '../../services/measurementService.js';
import { assessmentService } from '../../services/assessmentService.js';
import './InitialAssessment.css';

const ALL_FIELDS = FORM_SECTIONS.flatMap((section) => section.fields);
const FIELD_LABELS_BY_ID = Object.fromEntries(ALL_FIELDS.map((field) => [field.id, field.label]));

function InitialAssessment({ onComplete }) {
    const [initialAssessment, setInitialAssessment] = useState({});
    const [measurement, setMeasurement] = useState({});
    const [userInfo, setUserInfo] = useState({});
    const [showPhotoCapture, setShowPhotoCapture] = useState(false);

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

    const handleFieldChange = (group, event) => {
        const { id, name, value } = event.target;
        const key = name || id;
        
        if (group === 'userInfo') {
            setUserInfo((prev) => ({ ...prev, [key]: value }));
        } else if (group === 'measurement') {
            setMeasurement((prev) => ({ ...prev, [key]: value }));
        } else if (group === 'initialAssessment') {
            setInitialAssessment((prev) => ({ ...prev, [key]: value }));
        }
    };

    const onSubmit = async () => {
        const profileId = await profileService.getOrCreate({
            name: userInfo.name || null,
            surname: userInfo.surname || null,
            birthdate: userInfo.birthdate || null,
            gender: userInfo.gender || null,
        });

        const alreadyExists = await assessmentService.exists(profileId);
        if (alreadyExists) {
            throw new Error('Ya has completado tu valoración inicial anteriormente.');
        }

        await measurementService.createWeightOnly(measurement.weight);
        await assessmentService.create(profileId, initialAssessment);
    };

    const onSubmitClick = () => handleSubmit(onSubmit);

    const handleSkipPhotos = () => {
        if (onComplete) {
            setTimeout(() => onComplete(), 0);
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

            <DynamicForm
                sections={FORM_SECTIONS}
                values={{ userInfo, measurement, initialAssessment }}
                onChange={handleFieldChange}
                fieldValidity={fieldValidity}
                submitAttempted={submitAttempted}
                onValidityChange={handleValidityChange}
            />

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

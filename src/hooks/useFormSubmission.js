import { useState, useRef, useCallback } from 'react';

function useFormSubmission({ fieldLabelsById = {}, onSuccess }) {
    const [fieldValidity, setFieldValidity] = useState({});
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const isSubmittingRef = useRef(false);

    const handleValidityChange = useCallback((id, isValid) => {
        setFieldValidity((prev) => (prev[id] === isValid ? prev : { ...prev, [id]: isValid }));
    }, []);

    const resetForm = () => {
        setFieldValidity({});
        setSubmitAttempted(false);
        setSubmitError('');
    };

    const handleSubmit = async (submitFn) => {
        if (isSubmittingRef.current) {
            return;
        }

        setSubmitError('');
        setSubmitSuccess(false);
        setSubmitAttempted(true);

        const invalidFieldIds = Object.entries(fieldValidity)
            .filter(([, isValid]) => !isValid)
            .map(([id]) => id);

        if (invalidFieldIds.length > 0) {
            const invalidLabels = invalidFieldIds.map((id) => fieldLabelsById[id] || id);
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
            await submitFn();
            setSubmitSuccess(true);
            if (onSuccess) {
                onSuccess();
            }
        } catch (exception) {
            setSubmitError(exception.message);
        } finally {
            setSubmitting(false);
            isSubmittingRef.current = false;
        }
    };

    return {
        fieldValidity,
        submitAttempted,
        submitting,
        submitError,
        submitSuccess,
        handleValidityChange,
        handleSubmit,
        resetForm,
    };
}

export default useFormSubmission;
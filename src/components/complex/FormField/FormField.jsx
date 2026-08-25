import { useEffect } from 'react';


/**
 * Campo de formulario de texto/número con validación de obligatoriedad.
 *
 * @param {Object} props - Props del componente.
 * @param {string} props.label - Etiqueta.
 * @param {string} props.id - Id del campo.
 * @param {string} [props.type='text'] - Tipo de input.
 * @param {string} [props.step] - Paso para inputs numéricos.
 * @param {string} [props.placeholder] - Placeholder.
 * @param {*} props.value - Valor del campo.
 * @param {(event: Object) => void} props.onChange - Callback de cambio.
 * @param {boolean} [props.required=false] - Si es obligatorio.
 * @param {boolean} [props.hasError=false] - Si debe marcarse como error.
 * @param {(id: string, isValid: boolean) => void} [props.onValidityChange] - Callback de validez.
 */
function FormField({ label, id, type = 'text', step, placeholder, value, onChange, required = false, hasError = false, onValidityChange }) {
    useEffect(() => {
        if (!onValidityChange) return;
        const isEmpty = value === undefined || value === null || value === '';
        onValidityChange(id, !required || !isEmpty);
    }, [id, value, required, onValidityChange]);

    return (
        <div className="form-field">
            <div className="form-field-label">
                <label htmlFor={id}>{label}</label>
                {required && <span className="required-asterisk">*</span>}
            </div>
            <input
                id={id}
                type={type}
                step={step}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={hasError ? 'form-field-input input-error' : 'form-field-input'}
            />
        </div>
    );
}

export default FormField;

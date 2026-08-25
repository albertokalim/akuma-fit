import { useEffect } from 'react';


/**
 * Grupo de opciones de tipo radio con validación de obligatoriedad.
 *
 * @param {Object} props - Props del componente.
 * @param {string} props.label - Etiqueta del grupo.
 * @param {string} props.id - Id del grupo.
 * @param {Array<{value: string, label: string}>} props.options - Opciones.
 * @param {*} props.value - Valor seleccionado.
 * @param {(event: Object) => void} props.onChange - Callback de cambio.
 * @param {boolean} [props.required=false] - Si es obligatorio.
 * @param {boolean} [props.hasError=false] - Si debe marcarse como error.
 * @param {(id: string, isValid: boolean) => void} [props.onValidityChange] - Callback de validez.
 */
function RadioGroupField({ label, id, options, value, onChange, required = false, hasError = false, onValidityChange }) {
    useEffect(() => {
        if (!onValidityChange) return;
        const isEmpty = value === undefined || value === null || value === '';
        onValidityChange(id, !required || !isEmpty);
    }, [id, value, required, onValidityChange]);

    return (
        <div className={`radio-group-field${hasError ? ' has-error' : ''}`}>
            <div className="radio-group-label">
                <label htmlFor={id}>{label}</label>
                {required && <span className="required-asterisk">*</span>}
            </div>
            <div className="radio-options">
                {options.map((option) => (
                    <div key={option.value} className="radio-option">
                        <input
                            type="radio"
                            id={`${id}-${option.value}`}
                            name={id}
                            value={option.value}
                            checked={value === option.value}
                            onChange={onChange}
                        />
                        <label htmlFor={`${id}-${option.value}`}>{option.label}</label>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RadioGroupField;

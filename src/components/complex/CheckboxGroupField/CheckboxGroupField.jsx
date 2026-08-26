import { useEffect } from 'react';


/**
 * Grupo de opciones tipo checkbox o radio (según `multiple`) con validación.
 *
 * @param {Object} props - Props del componente.
 * @param {string} props.label - Etiqueta del grupo.
 * @param {string} props.id - Id del grupo.
 * @param {Array<{value: string, label: string}>} props.options - Opciones.
 * @param {*} props.value - Valor(es) seleccionado(s).
 * @param {(event: Object) => void} props.onChange - Callback de cambio.
 * @param {boolean} [props.required=false] - Si es obligatorio.
 * @param {boolean} [props.multiple=true] - Si permite selección múltiple.
 * @param {boolean} [props.hasError=false] - Si debe marcarse como error.
 * @param {(id: string, isValid: boolean) => void} [props.onValidityChange] - Callback de validez.
 */
function CheckboxGroupField({ label, id, options, value, onChange, required = false, multiple = true, hasError = false, onValidityChange }) {
    useEffect(() => {
        if (!onValidityChange) return;
        const isEmpty = multiple ? !Array.isArray(value) || value.length === 0 : (value === undefined || value === null || value === '');
        onValidityChange(id, !required || !isEmpty);
    }, [id, value, required, multiple, onValidityChange]);

    return (
        <div className={`checkbox-group-field${hasError ? ' has-error' : ''}`}>
            <div className="checkbox-group-label">
                <label htmlFor={id}>{label}</label>
                {required && <span className="required-asterisk">*</span>}
            </div>
            <div className="checkbox-options">
                {options.map((option) => (
                    <div key={option.value} className="checkbox-option">
                        <input
                            type={multiple ? 'checkbox' : 'radio'}
                            id={`${id}-${option.value}`}
                            name={id}
                            value={option.value}
                            checked={multiple ? value.includes(option.value) : value === option.value}
                            onChange={onChange}
                        />
                        <label htmlFor={`${id}-${option.value}`}>{option.label}</label>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CheckboxGroupField;

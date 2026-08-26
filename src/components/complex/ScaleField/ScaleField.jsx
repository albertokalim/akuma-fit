import { useEffect } from 'react';


/**
 * Campo de escala numérica (radio buttons de min a max) con validación.
 *
 * @param {Object} props - Props del componente.
 * @param {string} props.label - Etiqueta.
 * @param {string} props.id - Id del campo.
 * @param {number} [props.min=1] - Valor mínimo.
 * @param {number} [props.max=10] - Valor máximo.
 * @param {*} props.value - Valor seleccionado.
 * @param {(event: Object) => void} props.onChange - Callback de cambio.
 * @param {string} [props.leftLabel] - Etiqueta del extremo izquierdo.
 * @param {string} [props.rightLabel] - Etiqueta del extremo derecho.
 * @param {boolean} [props.required=false] - Si es obligatorio.
 * @param {boolean} [props.hasError=false] - Si debe marcarse como error.
 * @param {(id: string, isValid: boolean) => void} [props.onValidityChange] - Callback de validez.
 */
function ScaleField({ label, id, min = 1, max = 10, value, onChange, leftLabel = '', rightLabel = '', required = false, hasError = false, onValidityChange }) {
    const options = Array.from({ length: max - min + 1 }, (_, i) => ({
        value: (i + min).toString(),
        label: (i + min).toString()
    }));

    useEffect(() => {
        if (!onValidityChange) return;
        const isEmpty = value === undefined || value === null || value === '';
        onValidityChange(id, !required || !isEmpty);
    }, [id, value, required, onValidityChange]);

    return (
        <div className={`scale-field${hasError ? ' has-error' : ''}`}>
            <div className="scale-label">
                <label htmlFor={id}>{label}</label>
                {required && <span className="required-asterisk">*</span>}
            </div>
            <div className="scale-options">
                {options.map((option) => (
                    <div key={option.value} className="scale-option">
                        <span className="scale-number">{option.label}</span>
                        <input
                            type="radio"
                            id={`${id}-${option.value}`}
                            name={id}
                            value={option.value}
                            checked={value === option.value}
                            onChange={onChange}
                        />
                    </div>
                ))}
            </div>
            <div className="scale-labels">
                <span className="scale-left-label">{leftLabel}</span>
                <span className="scale-right-label">{rightLabel}</span>
            </div>
        </div>
    );
}

export default ScaleField;

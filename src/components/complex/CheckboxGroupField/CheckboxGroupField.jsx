import { useEffect } from 'react';


function CheckboxGroupField({ label, id, options, value, onChange, required = false, multiple = true, hasError = false, onValidityChange }) {
    useEffect(() => {
        if (!onValidityChange) return;
        // El criterio de "vacío" depende de si el campo admite selección múltiple (array) o única (string).
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

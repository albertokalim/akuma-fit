import { useEffect } from 'react';


function FormField({ label, id, type = 'text', step, placeholder, value, onChange, required = false, hasError = false, onValidityChange }) {
    // El propio campo sabe qué significa "estar vacío" para su tipo de valor (string)
    // y avisa al padre de su validez cada vez que cambia, sin que el padre tenga
    // que conocer esta lógica.
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

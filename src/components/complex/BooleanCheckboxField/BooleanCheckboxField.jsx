import { useEffect } from 'react';
import './BooleanCheckboxField.css';

function BooleanCheckboxField({ label, id, value, onChange, required = false, hasError = false, onValidityChange }) {
    useEffect(() => {
        if (!onValidityChange) return;
        const isChecked = value === true;
        onValidityChange(id, !required || isChecked);
    }, [id, value, required, onValidityChange]);

    const handleChange = (event) => {
        onChange({ target: { id, name: id, value: event.target.checked } });
    };

    return (
        <div className={`boolean-checkbox-field${hasError ? ' has-error' : ''}`}>
            <div className="boolean-checkbox-option">
                <input
                    type="checkbox"
                    id={id}
                    name={id}
                    checked={value === true}
                    onChange={handleChange}
                />
                <div className="boolean-checkbox-label-row">
                    <label htmlFor={id}>{label}</label>
                    {required && <span className="required-asterisk">*</span>}
                </div>
            </div>
        </div>
    );
}

export default BooleanCheckboxField;
import Label from './Label.jsx';
import './CheckboxGroupField.css';

function CheckboxGroupField({ label, id, options, value, onChange, required = false, multiple = true }) {
    const handleChange = (optionValue) => {
        if (multiple) {
            if (value.includes(optionValue)) {
                onChange(value.filter(v => v !== optionValue));
            } else {
                onChange([...value, optionValue]);
            }
        } else {
            onChange(value.includes(optionValue) ? [] : [optionValue]);
        }
    };

    return (
        <div className="checkbox-group-field">
            <div className="checkbox-group-label">
                <Label text={label} htmlFor={id} />
                {required && <span className="required-asterisk">*</span>}
            </div>
            <div className="checkbox-options">
                {options.map((option) => (
                    <div key={option.value} className="checkbox-option">
                        <input
                            type="checkbox"
                            id={`${id}-${option.value}`}
                            name={id}
                            value={option.value}
                            checked={value.includes(option.value)}
                            onChange={() => handleChange(option.value)}
                        />
                        <label htmlFor={`${id}-${option.value}`}>{option.label}</label>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CheckboxGroupField;

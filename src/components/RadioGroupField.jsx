import Label from './Label.jsx';
import './RadioGroupField.css';

function RadioGroupField({ label, id, options, value, onChange, required = false }) {
    return (
        <div className="radio-group-field">
            <div className="radio-group-label">
                <Label text={label} htmlFor={id} />
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
                            onChange={(e) => onChange(e.target.value)}
                        />
                        <label htmlFor={`${id}-${option.value}`}>{option.label}</label>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RadioGroupField;

import Label from '../../primitives/Label/Label.jsx';
import './CheckboxGroupField.css';

function CheckboxGroupField({ label, id, options, value, onChange, required = false, multiple = true }) {
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

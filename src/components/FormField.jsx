import Label from './Label.jsx';
import TextInput from './TextInput.jsx';
import './FormField.css';

function FormField({ label, id, type = 'text', placeholder, value, onChange, required = false }) {
    return (
        <div className="form-field">
            <div className="form-field-label">
                <Label text={label} htmlFor={id} />
                {required && <span className="required-asterisk">*</span>}
            </div>
            <TextInput
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className="form-field-input"
            />
        </div>
    );
}

export default FormField;

import Label from '../../primitives/Label/Label.jsx';
import './ScaleField.css';

function ScaleField({ label, id, min = 1, max = 10, value, onChange, leftLabel = '', rightLabel = '', required = false }) {
    const options = Array.from({ length: max - min + 1 }, (_, i) => ({
        value: (i + min).toString(),
        label: (i + min).toString()
    }));

    return (
        <div className="scale-field">
            <div className="scale-label">
                <Label text={label} htmlFor={id} />
                {required && <span className="required-asterisk">*</span>}
            </div>
            <div className="scale-numbers">
                {options.map((option) => (
                    <span key={option.value} className="scale-number">{option.label}</span>
                ))}
            </div>
            <div className="scale-options">
                {options.map((option) => (
                    <div key={option.value} className="scale-option">
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

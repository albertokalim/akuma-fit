import FormSection from '../FormSection/FormSection.jsx';
import FormField from '../FormField/FormField.jsx';
import RadioGroupField from '../RadioGroupField/RadioGroupField.jsx';
import CheckboxGroupField from '../CheckboxGroupField/CheckboxGroupField.jsx';
import ScaleField from '../ScaleField/ScaleField.jsx';
import BooleanCheckboxField from '../BooleanCheckboxField/BooleanCheckboxField.jsx';

 
function DynamicForm({ 
    sections, 
    values, 
    onChange, 
    fieldValidity, 
    submitAttempted, 
    onValidityChange 
}) {
    const renderField = (field) => {
        const value = values[field.group]?.[field.id];
        const handleChange = (event) => onChange(field.group, event);
        const hasError = submitAttempted && fieldValidity[field.id] === false;

        const commonProps = {
            key: field.id,
            id: field.id,
            label: field.label,
            required: field.required,
            value: value || '',
            onChange: handleChange,
            hasError,
            onValidityChange,
        };

        switch (field.component) {
            case 'radio':
                return (
                    <RadioGroupField
                        {...commonProps}
                        options={field.options}
                    />
                );
            
            case 'checkbox':
                return (
                    <CheckboxGroupField
                        {...commonProps}
                        multiple={false}
                        options={field.options}
                        value={value || field.defaultValue || ''}
                    />
                );
            
            case 'scale':
                return (
                    <ScaleField
                        {...commonProps}
                        leftLabel={field.leftLabel}
                        rightLabel={field.rightLabel}
                        min={field.min}
                        max={field.max}
                    />
                );
            
            case 'boolean-checkbox':
                return (
                    <BooleanCheckboxField
                        key={field.id}
                        id={field.id}
                        label={field.label}
                        required={field.required}
                        value={value === true}
                        onChange={handleChange}
                        hasError={hasError}
                        onValidityChange={onValidityChange}
                    />
                );
            
            case 'text':
            default:
                return (
                    <FormField
                        {...commonProps}
                        placeholder={field.placeholder}
                        type={field.type || 'text'}
                        step={field.step}
                    />
                );
        }
    };

    return sections.map((section) => (
        <FormSection key={section.title} title={section.title}>
            {section.fields.map(renderField)}
        </FormSection>
    ));
}

export default DynamicForm;

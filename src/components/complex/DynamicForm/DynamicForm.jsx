import FormSection from '../FormSection/FormSection.jsx';
import FormField from '../FormField/FormField.jsx';
import RadioGroupField from '../RadioGroupField/RadioGroupField.jsx';
import CheckboxGroupField from '../CheckboxGroupField/CheckboxGroupField.jsx';
import ScaleField from '../ScaleField/ScaleField.jsx';
import BooleanCheckboxField from '../BooleanCheckboxField/BooleanCheckboxField.jsx';

/**
 * Componente de formulario dinámico que renderiza campos basado en configuración JSON
 * Centraliza la lógica de renderField() que estaba duplicada en múltiples formularios
 * 
 * @param {Object} props
 * @param {Array} props.sections - Secciones del formulario desde JSON
 * @param {Object} props.values - Valores actuales del formulario { groupName: { fieldId: value } }
 * @param {Function} props.onChange - Callback para cambios de campo (group, event) => void
 * @param {Object} props.fieldValidity - Objeto de validez de campos { fieldId: boolean }
 * @param {boolean} props.submitAttempted - Si se ha intentado enviar el formulario
 * @param {Function} props.onValidityChange - Callback para cambios de validez (id, isValid) => void
 */
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

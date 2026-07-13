import { useState } from 'react';
import FormField from './components/FormField.jsx';
import RadioGroupField from './components/RadioGroupField.jsx';
import CheckboxGroupField from './components/CheckboxGroupField.jsx';
import ScaleField from './components/ScaleField.jsx';
import FormSection from './components/FormSection.jsx';
import Button from './components/Button.jsx';
import formConfig from './formConfig.json';

function DynamicForm({ onFormDataChange }) {
    const [formData, setFormData] = useState(() => {
        const initialData = {};
        formConfig.sections.forEach(section => {
            section.fields.forEach(field => {
                if (field.type === 'checkbox') {
                    initialData[field.id] = [];
                } else {
                    initialData[field.id] = '';
                }
            });
        });
        return initialData;
    });

    const handleInputChange = (fieldId, value) => {
        const newData = {
            ...formData,
            [fieldId]: value
        };
        setFormData(newData);
        if (onFormDataChange) {
            onFormDataChange(newData);
        }
    };

    const renderField = (field) => {
        switch (field.type) {
            case 'text':
            case 'email':
            case 'number':
                return (
                    <FormField
                        key={field.id}
                        label={field.label}
                        id={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.id]}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                    />
                );
            case 'radio':
                return (
                    <RadioGroupField
                        key={field.id}
                        label={field.label}
                        id={field.id}
                        options={field.options}
                        value={formData[field.id]}
                        onChange={(value) => handleInputChange(field.id, value)}
                        required={field.required}
                    />
                );
            case 'checkbox':
                return (
                    <CheckboxGroupField
                        key={field.id}
                        label={field.label}
                        id={field.id}
                        options={field.options}
                        value={formData[field.id]}
                        onChange={(value) => handleInputChange(field.id, value)}
                        required={field.required}
                        multiple={true}
                    />
                );
            case 'scale':
                return (
                    <ScaleField
                        key={field.id}
                        label={field.label}
                        id={field.id}
                        min={field.min || 1}
                        max={field.max || 10}
                        value={formData[field.id]}
                        onChange={(value) => handleInputChange(field.id, value)}
                        leftLabel={field.leftLabel}
                        rightLabel={field.rightLabel}
                        required={field.required}
                    />
                );
            default:
                return null;
        }
    };

    const handleSubmit = () => {
        alert('Formulario enviado: ' + JSON.stringify(formData, null, 2));
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>📋 Valoración Inicial</h1>

            {formConfig.sections.map(section => (
                <FormSection key={section.id} title={section.title}>
                    {section.fields.map(field => renderField(field))}
                </FormSection>
            ))}

            <div style={{ textAlign: 'center', marginTop: '30px' }}>
                <Button text="Enviar Formulario" onClick={handleSubmit} />
            </div>
        </div>
    );
}

export default DynamicForm;

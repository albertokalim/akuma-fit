import { useState } from 'react';
import DynamicForm from './DynamicForm.jsx';

function TestComponent() {
    const [formData, setFormData] = useState({});

    return (
        <>
            <DynamicForm onFormDataChange={setFormData} />
            
            <div>
                <h2>📊 Datos del Formulario:</h2>
                <pre>
                    {JSON.stringify(formData, null, 2)}
                </pre>
            </div>
        </>
    );
}

export default TestComponent;



import { useState } from 'react';
import DynamicForm from './DynamicForm.jsx';

function TestComponent() {
    const [formData, setFormData] = useState({});

    return (
        <>
            <DynamicForm onFormDataChange={setFormData} />
            
            <div style={{ 
                padding: '20px', 
                maxWidth: '600px', 
                margin: '20px auto',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                border: '1px solid #ddd'
            }}>
                <h2>📊 Datos del Formulario:</h2>
                <pre style={{
                    backgroundColor: '#fff',
                    padding: '15px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '12px'
                }}>
                    {JSON.stringify(formData, null, 2)}
                </pre>
            </div>
        </>
    );
}

export default TestComponent;



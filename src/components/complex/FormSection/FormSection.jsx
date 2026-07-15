import './FormSection.css';

function FormSection({ title, children }) {
    return (
        <div className="form-section">
            <h1 className="form-section-title">{title}</h1>
            <div className="form-section-content">
                {children}
            </div>
        </div>
    );
}

export default FormSection;

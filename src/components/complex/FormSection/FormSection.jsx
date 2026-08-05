

function FormSection({ title, children }) {
    return (
        <div className="form-section">
            <h2 className="form-section-title">{title}</h2>
            <div className="form-section-content">
                {children}
            </div>
        </div>
    );
}

export default FormSection;

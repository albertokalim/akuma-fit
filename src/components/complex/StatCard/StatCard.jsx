

/**
 * Tarjeta de estadística con valor, etiqueta y un icono opcional.
 *
 * @param {Object} props - Props del componente.
 * @param {React.ReactNode} props.value - Valor a mostrar.
 * @param {string} props.label - Etiqueta descriptiva.
 * @param {React.ReactNode} [props.icon] - Icono opcional.
 */
function StatCard({ value, label, icon }) {
    return (
        <div className="stat-card">
            {icon && <div className="stat-icon">{icon}</div>}
            <div className="stat-content">
                <div className="stat-value">{value}</div>
                <label className="stat-label">{label}</label>
            </div>
        </div>
    );
}

export default StatCard;

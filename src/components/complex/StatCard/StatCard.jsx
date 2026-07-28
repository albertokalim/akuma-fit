import './StatCard.css';

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

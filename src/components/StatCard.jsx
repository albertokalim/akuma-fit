import Label from './Label.jsx';
import './StatCard.css';

function StatCard({ value, label, icon }) {
    return (
        <div className="stat-card">
            {icon && <div className="stat-icon">{icon}</div>}
            <div className="stat-content">
                <div className="stat-value">{value}</div>
                <Label text={label} className="stat-label" />
            </div>
        </div>
    );
}

export default StatCard;

import './LineChart.css';

function LineChart({ title, data }) {
    return (
        <div className="line-chart">
            <h3 className="chart-title">{title}</h3>
            <div className="chart-placeholder">
                {/* Aquí irá el gráfico real cuando integremos Recharts o similar */}
                <p>Gráfico de líneas - A implementar</p>
            </div>
        </div>
    );
}

export default LineChart;

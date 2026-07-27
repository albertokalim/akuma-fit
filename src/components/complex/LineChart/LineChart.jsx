import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './LineChart.css';

function LineChart({ title, data, lines = [], xKey = 'date' }) {
    if (!data || data.length === 0) {
        return (
            <div className="line-chart">
                <h3 className="chart-title">{title}</h3>
                <div className="chart-empty">
                    <p>No hay datos disponibles</p>
                </div>
            </div>
        );
    }

    return (
        <div className="line-chart">
            <h3 className="chart-title">{title}</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 30 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis 
                            dataKey={xKey} 
                            stroke="var(--color-text-muted)"
                            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                        />
                        <YAxis 
                            stroke="var(--color-text-muted)"
                            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                        />
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: 'var(--color-surface-alt)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                color: 'var(--color-text)'
                            }}
                        />
                        <Legend 
                            wrapperStyle={{ color: 'var(--color-text)' }}
                        />
                        {lines.map((line) => (
                            <Line
                                key={line.dataKey}
                                type="monotone"
                                dataKey={line.dataKey}
                                stroke={line.color}
                                strokeWidth={2}
                                dot={{ fill: line.color, r: 4 }}
                                name={line.name}
                            />
                        ))}
                    </RechartsLineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default LineChart;
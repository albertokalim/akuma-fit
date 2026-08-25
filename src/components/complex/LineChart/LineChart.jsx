import { useState } from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


/**
 * Gráfico de líneas basado en Recharts, con controles opcionales para
 * mostrar/ocultar líneas.
 *
 * @param {Object} props - Props del componente.
 * @param {string} props.title - Título del gráfico.
 * @param {Array<Object>} props.data - Datos a representar.
 * @param {Array<{dataKey: string, name: string, color: string}>} [props.lines] - Líneas.
 * @param {string} [props.xKey='date'] - Clave del eje X.
 * @param {boolean} [props.showControls=false] - Mostrar controles para ocultar líneas.
 */
function LineChart({ title, data, lines = [], xKey = 'date', showControls = false }) {
    const [activeLines, setActiveLines] = useState(
        Object.fromEntries(lines.map(line => [line.dataKey, true]))
    );

    const toggleLine = (lineKey) => {
        setActiveLines(prev => ({
            ...prev,
            [lineKey]: !prev[lineKey]
        }));
    };

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

    const visibleLines = showControls ? lines.filter(line => activeLines[line.dataKey]) : lines;

    return (
        <div className="line-chart">
            <h3 className="chart-title">{title}</h3>
            {showControls && lines.length > 1 && (
                <div className="chart-controls">
                    {lines.map(line => (
                        <label key={line.dataKey} className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={activeLines[line.dataKey]}
                                onChange={() => toggleLine(line.dataKey)}
                            />
                            <span style={{ color: line.color }}>{line.name}</span>
                        </label>
                    ))}
                </div>
            )}
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
                        {visibleLines.map((line) => (
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
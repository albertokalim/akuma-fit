import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LineChart from '../../components/complex/LineChart/LineChart.jsx';
import StatCard from '../../components/complex/StatCard/StatCard.jsx';
import Spinner from '../../components/primitives/Spinner/Spinner.jsx';
import ColorSwatch from '../../components/primitives/ColorSwatch/ColorSwatch.jsx';
import { useResource } from '../../hooks/useResource.js';
import { useAutoLoad } from '../../hooks/useAutoLoad.js';
import { measurementService } from '../../services/measurementService.js';
import { MEASUREMENT_OPTIONS } from '../../config/measurementOptions.js';
import { buildChartData, buildActiveLines, calculateDelta, calculateVelocity, getCurrentValue } from '../../utils/chartData.js';
import { FiActivity, FiCamera, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';


/**
 * Calcula las fechas (lunes y domingo) de la semana actual en formato
 * YYYY-MM-DD.
 *
 * @returns {{start: string, end: string}} Fechas de inicio y fin de la semana.
 */
const getCurrentWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    const monday = new Date(now);
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(now.getDate() - daysToMonday);
    
    const sunday = new Date(now);
    const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    sunday.setDate(now.getDate() + daysToSunday);
    
    const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    return {
        start: formatDateForInput(monday),
        end: formatDateForInput(sunday)
    };
};

const initialDates = getCurrentWeekDates();

/**
 * Vista "Progreso" del cliente: medidas corporales con filtros de fecha,
 * métricas (peso, delta, velocidad) y gráfico de evolución.
 */
function Progress() {
    const navigate = useNavigate();
    const { items: measurements, loading, error, load } = useResource(measurementService);
    useAutoLoad(load);
    
    const [selectedMeasures, setSelectedMeasures] = useState(['weight']);
    const [startDate, setStartDate] = useState(initialDates.start);
    const [endDate, setEndDate] = useState(initialDates.end);

    const toggleMeasure = (key) => {
        setSelectedMeasures((prev) =>
            prev.includes(key)
                ? prev.filter((k) => k !== key)
                : [...prev, key]
        );
    };

    const chartData = buildChartData(measurements, MEASUREMENT_OPTIONS, startDate, endDate);
    const activeLines = buildActiveLines(MEASUREMENT_OPTIONS, selectedMeasures);

    const currentWeight = getCurrentValue(measurements, 'weight');
    const weightDelta = calculateDelta(measurements, 'weight');
    const weightVelocity = calculateVelocity(measurements, 'weight');

    const getDeltaIcon = (delta) => {
        if (delta === null) return null;
        return delta > 0 ? <FiTrendingUp /> : delta < 0 ? <FiTrendingDown /> : null;
    };

    const formatVelocity = (velocity, unit) => {
        if (velocity === null) return '-';
        const sign = velocity > 0 ? '+' : '';
        return `${sign}${velocity} ${unit}/sem`;
    };

    return (
        <div className="dashboard-main">
            <div className="dashboard-title">
                <h1>Progreso</h1>
            </div>

            {loading && <Spinner text="Cargando mediciones..." />}
            {error && <div className="error-message">{error}</div>}

            {!loading && !error && measurements.length === 0 && (
                <div className="empty-state">
                    <p>Aún no has registrado ninguna medición.</p>
                    <p>¡Registra tu primera medición para empezar a ver tu progreso!</p>
                </div>
            )}

            {!loading && !error && measurements.length > 0 && (
                <>
                    <section className="stats-section">
                        <div className="stats-grid">
                            {currentWeight !== null && (
                                <StatCard
                                    value={`${currentWeight} kg`}
                                    label="Peso actual"
                                    icon={<FiActivity />}
                                />
                            )}
                            {weightDelta !== null && (
                                <StatCard
                                    value={`${weightDelta > 0 ? '+' : ''}${weightDelta} kg`}
                                    label="Delta peso"
                                    icon={getDeltaIcon(weightDelta)}
                                />
                            )}
                            {weightVelocity !== null && (
                                <StatCard
                                    value={formatVelocity(weightVelocity, 'kg')}
                                    label="Velocidad peso"
                                    icon={getDeltaIcon(weightVelocity)}
                                />
                            )}
                        </div>
                    </section>

                    <section className="events-section">
                        <div className="measurements-selector">
                            <span className="selector-label">Filtrar por fechas:</span>
                            <div className="measurements-options">
                                <div className="measurement-option">
                                    <label htmlFor="startDate">Desde:</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="measurement-option">
                                    <label htmlFor="endDate">Hasta:</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="events-section">
                        <div className="measurements-selector">
                            <span className="selector-label">Selecciona las medidas a mostrar:</span>
                            <div className="measurements-options">
                                {MEASUREMENT_OPTIONS.map((opt) => (
                                    <label key={opt.key} className="measurement-option">
                                        <input
                                            type="checkbox"
                                            checked={selectedMeasures.includes(opt.key)}
                                            onChange={() => toggleMeasure(opt.key)}
                                        />
                                        <ColorSwatch color={opt.color} />
                                        <span>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="events-section">
                        {selectedMeasures.length > 0 ? (
                            <LineChart
                                title="Evolución de medidas"
                                data={chartData}
                                lines={activeLines}
                            />
                        ) : (
                            <div className="empty-state">
                                <p>Selecciona al menos una medida para ver la gráfica.</p>
                            </div>
                        )}
                    </section>
                </>
            )}

            <button onClick={() => navigate('/app/progress/weight')} className="btn-fab" style={{ right: '100px' }}>
                <span className="button-icon"><FiActivity size={20} /></span>
            </button>
            <button onClick={() => navigate('/app/progress/photos')} className="btn-fab">
                <span className="button-icon"><FiCamera size={20} /></span>
            </button>
        </div>
    );
}

export default Progress;

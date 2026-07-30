import { useState } from 'react';
import LineChart from '../../components/complex/LineChart/LineChart.jsx';
import StatCard from '../../components/complex/StatCard/StatCard.jsx';
import Spinner from '../../components/primitives/Spinner/Spinner.jsx';
import WeightLogForm from '../WeightLogForm/WeightLogForm.jsx';
import BodyPhotos from '../BodyPhotos/BodyPhotos.jsx';
import { useResource } from '../../hooks/useResource.js';
import { useAutoLoad } from '../../hooks/useAutoLoad.js';
import { measurementService } from '../../services/measurementService.js';
import { buildChartData, buildActiveLines, calculateDelta, calculateVelocity, getCurrentValue } from '../../utils/chartData.js';
import { FiActivity, FiCamera, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';
import './Progress.css';

const MEASUREMENT_OPTIONS = [
    { key: 'weight', label: 'Peso (kg)', color: '#a78bfa' },
    { key: 'chest', label: 'Pecho (cm)', color: '#4ade80' },
    { key: 'waist', label: 'Cintura (cm)', color: '#f87171' },
    { key: 'hip', label: 'Cadera (cm)', color: '#60a5fa' },
];

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

function Progress() {
    const { items: measurements, loading, error, load } = useResource(measurementService);
    useAutoLoad(load);
    
    const [selectedMeasures, setSelectedMeasures] = useState(['weight']);
    const [startDate, setStartDate] = useState(initialDates.start);
    const [endDate, setEndDate] = useState(initialDates.end);
    const [showForm, setShowForm] = useState(false);
    const [showBodyPhotos, setShowBodyPhotos] = useState(false);

    const handleFormComplete = () => {
        setShowForm(false);
        load();
    };

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
    const currentWaist = getCurrentValue(measurements, 'waist');
    const weightDelta = calculateDelta(measurements, 'weight');
    const waistDelta = calculateDelta(measurements, 'waist');
    const weightVelocity = calculateVelocity(measurements, 'weight');
    const waistVelocity = calculateVelocity(measurements, 'waist');

    const getDeltaIcon = (delta) => {
        if (delta === null) return null;
        return delta > 0 ? <FiTrendingUp /> : delta < 0 ? <FiTrendingDown /> : null;
    };

    const formatVelocity = (velocity, unit) => {
        if (velocity === null) return '-';
        const sign = velocity > 0 ? '+' : '';
        return `${sign}${velocity} ${unit}/sem`;
    };

    if (showBodyPhotos) {
        return <BodyPhotos onBack={() => setShowBodyPhotos(false)} />;
    }

    if (showForm) {
        return <WeightLogForm onComplete={handleFormComplete} onCancel={() => setShowForm(false)} />;
    }

    return (
        <div className="progress">
            <h1 className="progress-title">Progreso</h1>
            <p className="progress-description">Visualiza la evolución de tus medidas a lo largo del tiempo.</p>

            {loading && <Spinner text="Cargando mediciones..." />}
            {error && <div className="error-message">{error}</div>}

            {!loading && !error && measurements.length === 0 && (
                <div className="progress-empty">
                    <p>Aún no has registrado ninguna medición.</p>
                    <p>¡Registra tu primera medición para empezar a ver tu progreso!</p>
                </div>
            )}

            {!loading && !error && measurements.length > 0 && (
                <>
                    <section className="progress-summary">
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

                    <div className="progress-selector">
                        <span className="progress-selector-label">Filtrar por fechas:</span>
                        <div className="progress-date-filters">
                            <div className="progress-date-filter">
                                <label htmlFor="startDate">Desde:</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="progress-date-filter">
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

                    <div className="progress-selector">
                        <span className="progress-selector-label">Selecciona las medidas a mostrar:</span>
                        <div className="progress-options">
                            {MEASUREMENT_OPTIONS.map((opt) => (
                                <label key={opt.key} className="progress-option">
                                    <input
                                        type="checkbox"
                                        checked={selectedMeasures.includes(opt.key)}
                                        onChange={() => toggleMeasure(opt.key)}
                                    />
                                    <span
                                        className="progress-option-color"
                                        style={{ backgroundColor: opt.color }}
                                    />
                                    <span>{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {selectedMeasures.length > 0 ? (
                        <LineChart
                            title="Evolución de medidas"
                            data={chartData}
                            lines={activeLines}
                        />
                    ) : (
                        <div className="progress-no-selection">
                            <p>Selecciona al menos una medida para ver la gráfica.</p>
                        </div>
                    )}
                </>
            )}

            <button onClick={() => setShowForm(true)} className="progress-fab progress-fab-weight">
                <span className="button-icon"><FiActivity size={20} /></span>
            </button>
            <button onClick={() => setShowBodyPhotos(true)} className="progress-fab progress-fab-photos">
                <span className="button-icon"><FiCamera size={20} /></span>
            </button>
        </div>
    );
}

export default Progress;

import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/complex/DataTable/DataTable.jsx';
import LineChart from '../../components/complex/LineChart/LineChart.jsx';
import StatCard from '../../components/complex/StatCard/StatCard.jsx';
import Spinner from '../../components/primitives/Spinner/Spinner.jsx';
import { useResource } from '../../hooks/useResource.js';
import { useAutoLoad } from '../../hooks/useAutoLoad.js';
import { checkInService } from '../../services/checkInService.js';
import {
    calculateStreak,
    calculateAverageAdherence,
    calculateAverage,
    buildChartData as buildCheckInChartData,
    generateInsights,
} from '../../utils/checkInStats.js';
import { formatDate } from '../../utils/data.js';
import { FiCheckCircle, FiTrendingUp, FiTarget, FiActivity, FiPlus } from 'react-icons/fi';
import './CheckIn.css';

function CheckIn() {
    const navigate = useNavigate();
    const { items: checkIns, loading, error, load } = useResource(checkInService);
    useAutoLoad(load);

    const checkInColumns = [
        { key: 'created_at', label: 'Fecha', render: (val) => formatDate(val) },
        { key: 'how_do_you_feel', label: '¿Cómo te has sentido?' },
        { key: 'diet_adherence', label: 'Dieta' },
        { key: 'training_adherence', label: 'Entrenamiento' },
        { key: 'hunger_level', label: 'Hambre' },
        { key: 'rest_quality', label: 'Descanso' },
        { key: 'comments', label: 'Comentarios' },
    ];

    const totalCheckIns = checkIns.length;
    const streak = calculateStreak(checkIns);
    const avgDiet = calculateAverageAdherence(checkIns, 'diet_adherence');
    const avgTraining = calculateAverageAdherence(checkIns, 'training_adherence');
    const avgRest = calculateAverage(checkIns, 'rest_quality');
    const avgHunger = calculateAverage(checkIns, 'hunger_level');

    const chartData = buildCheckInChartData(checkIns);

    const adherenceLines = [
        { dataKey: 'diet', name: 'Dieta (%)', color: '#a78bfa' },
        { dataKey: 'training', name: 'Entrenamiento (%)', color: '#4ade80' },
    ];

    const wellbeingLines = [
        { dataKey: 'rest', name: 'Descanso', color: '#60a5fa' },
        { dataKey: 'hunger', name: 'Hambre', color: '#f87171' },
    ];

    const insights = generateInsights(checkIns);

    return (
        <div className="check-in">
            <h1 className="check-in-title">Mis Check-Ins</h1>
            <p className="check-in-description">Revisa tu historial de check-ins semanales para ver tu progreso.</p>

            {loading && <Spinner text="Cargando check-ins..." />}
            {error && <div className="error-message">{error}</div>}

            {!loading && !error && checkIns.length === 0 && (
                <div className="check-in-empty">
                    <p>Aún no has realizado ningún check-in.</p>
                    <p>¡Haz tu primer check-in para empezar a trackear tu progreso!</p>
                </div>
            )}

            {!loading && !error && checkIns.length > 0 && (
                <>
                    <section className="check-in-stats">
                        <div className="check-in-stats-grid">
                            <StatCard
                                value={totalCheckIns}
                                label="Check-ins totales"
                                icon={<FiCheckCircle />}
                            />
                            <StatCard
                                value={streak}
                                label="Racha actual (semanas)"
                                icon={<FiTrendingUp />}
                            />
                            <StatCard
                                value={`${avgDiet}%`}
                                label="Adherencia dieta"
                                icon={<FiTarget />}
                            />
                            <StatCard
                                value={`${avgTraining}%`}
                                label="Adherencia entrenamiento"
                                icon={<FiActivity />}
                            />
                        </div>
                    </section>

                    <section className="check-in-charts">
                        <div className="check-in-charts-grid">
                            <LineChart
                                title="Adherencia"
                                data={chartData}
                                lines={adherenceLines}
                            />
                            <LineChart
                                title="Bienestar"
                                data={chartData}
                                lines={wellbeingLines}
                            />
                        </div>
                    </section>

                    {insights.length > 0 && (
                        <section className="check-in-insights">
                            <h2 className="check-in-insights-title">Resumen</h2>
                            <div className="check-in-insights-list">
                                {insights.map((insight, index) => (
                                    <div
                                        key={index}
                                        className={`check-in-insight check-in-insight-${insight.type}`}
                                    >
                                        <span className="check-in-insight-icon">
                                            {insight.type === 'positive' && '+'}
                                            {insight.type === 'warning' && '!'}
                                            {insight.type === 'neutral' && 'i'}
                                        </span>
                                        <span className="check-in-insight-text">{insight.text}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="check-in-history">
                        <h2 className="check-in-history-title">Historial</h2>
                        <DataTable columns={checkInColumns} data={checkIns} />
                    </section>

                    <div className="check-in-summary-bar">
                        <div className="check-in-summary-item">
                            <span className="check-in-summary-label">Descanso medio:</span>
                            <span className="check-in-summary-value">{avgRest}/10</span>
                        </div>
                        <div className="check-in-summary-item">
                            <span className="check-in-summary-label">Hambre media:</span>
                            <span className="check-in-summary-value">{avgHunger}/10</span>
                        </div>
                    </div>
                </>
            )}

            <button onClick={() => navigate('/app/checkin/new')} className="check-in-fab">
                <span className="button-icon"><FiPlus size={24} /></span>
            </button>
        </div>
    );
}

export default CheckIn;

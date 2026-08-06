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
import { CHART_COLORS } from '../../config/chartColors.js';
import { FiCheckCircle, FiTrendingUp, FiTarget, FiActivity, FiPlus } from 'react-icons/fi';


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
        { dataKey: 'diet', name: 'Dieta (%)', color: CHART_COLORS.primary },
        { dataKey: 'training', name: 'Entrenamiento (%)', color: CHART_COLORS.success },
    ];

    const wellbeingLines = [
        { dataKey: 'rest', name: 'Descanso', color: CHART_COLORS.info },
        { dataKey: 'hunger', name: 'Hambre', color: CHART_COLORS.error },
    ];

    const insights = generateInsights(checkIns);

    return (
        <div className="dashboard-main">
            <div className="dashboard-title">
                <h1>Mis Check-Ins</h1>
            </div>

            {loading && <Spinner text="Cargando check-ins..." />}
            {error && <div className="error-message">{error}</div>}

            {!loading && !error && checkIns.length === 0 && (
                <div className="empty-state">
                    <p>Aún no has realizado ningún check-in.</p>
                    <p>¡Haz tu primer check-in para empezar a trackear tu progreso!</p>
                </div>
            )}

            {!loading && !error && checkIns.length > 0 && (
                <>
                    <section className="stats-section">
                        <div className="stats-grid">
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

                    <section className="events-section">
                        <div className="charts-grid">
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
                        <section className="events-section">
                            <h2 className="section-title">Resumen</h2>
                            <div className="check-in-insights-list">
                                {insights.map((insight, index) => (
                                    <div
                                        key={index}
                                        className={`alert-item ${insight.type === 'positive' ? 'alert-success' : insight.type === 'warning' ? 'alert-warning' : 'alert-info'}`}
                                    >
                                        <span className="alert-icon">
                                            {insight.type === 'positive' && '✓'}
                                            {insight.type === 'warning' && '!'}
                                            {insight.type === 'neutral' && 'i'}
                                        </span>
                                        <span>{insight.text}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="events-section">
                        <h2 className="section-title">Historial</h2>
                        <DataTable columns={checkInColumns} data={checkIns} />
                    </section>
                </>
            )}

            <button onClick={() => navigate('/app/checkin/new')} className="btn-fab">
                <span className="button-icon"><FiPlus size={24} /></span>
            </button>
        </div>
    );
}

export default CheckIn;

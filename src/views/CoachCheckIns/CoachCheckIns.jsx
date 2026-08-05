import { useState } from 'react';
import LineChart from '../../components/complex/LineChart/LineChart.jsx';
import Spinner from '../../components/primitives/Spinner/Spinner.jsx';
import ClientSelector from '../../components/complex/ClientSelector/ClientSelector.jsx';
import CheckInDetailBlock from '../../components/complex/CheckInDetailBlock/CheckInDetailBlock.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { coachCheckInService } from '../../services/coachCheckInService.js';
import { generateCoachAlerts, buildChartData, ADHERENCE_MAP, getAdherenceClass } from '../../utils/checkInStats.js';
import { formatDate } from '../../utils/data.js';
import { FiAlertTriangle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './CoachCheckIns.css';

const COACH_CHART_FIELDS = [
    { key: 'energy', source: 'energy_level' },
    { key: 'gymPerformance', source: 'gym_performance' },
];

function CoachCheckIns() {
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [expandedCards, setExpandedCards] = useState({});

    const { data: clients, loading, error: clientsError } = useAsyncData(
        () => coachCheckInService.getClients().then((data) => {
            if (data.length > 0) setSelectedClientId((prev) => prev ?? data[0].id);
            return data;
        }),
        []
    );

    const { data: checkIns, loading: loadingCheckIns, error: checkInsError } = useAsyncData(
        selectedClientId ? () => coachCheckInService.getClientCheckIns(selectedClientId) : null,
        [selectedClientId]
    );

    const error = clientsError || checkInsError;

    const toggleCard = (index) => {
        setExpandedCards((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const selectedClient = clients.find((c) => c.id === selectedClientId);
    const latestCheckIn = checkIns.length > 0 ? checkIns[0] : null;
    const alerts = generateCoachAlerts(checkIns);
    const chartData = buildChartData(checkIns, COACH_CHART_FIELDS);

    const adherenceLines = [
        { dataKey: 'diet', name: 'Dieta (%)', color: '#a78bfa' },
        { dataKey: 'training', name: 'Entrenamiento (%)', color: '#4ade80' },
    ];

    const wellbeingLines = [
        { dataKey: 'rest', name: 'Descanso', color: '#60a5fa' },
        { dataKey: 'energy', name: 'Energía', color: '#fbbf24' },
        { dataKey: 'hunger', name: 'Hambre', color: '#f87171' },
    ];

    const performanceLines = [
        { dataKey: 'gymPerformance', name: 'Rendimiento gym (1-5)', color: '#a78bfa' },
    ];

    if (loading) {
        return <Spinner text="Cargando clientes..." />;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (clients.length === 0) {
        return (
            <div className="coach-checkins">
                <h1 className="coach-checkins-title">Check-Ins de Clientes</h1>
                <div className="coach-checkins-empty">
                    <p>No tienes clientes asignados.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="coach-checkins">
            <h1 className="coach-checkins-title">Check-Ins de Clientes</h1>

            <ClientSelector
                clients={clients}
                selectedClientId={selectedClientId}
                onChange={setSelectedClientId}
                className="coach-checkins-client-selector"
            />

            {loadingCheckIns ? (
                <Spinner text="Cargando check-ins..." />
            ) : checkIns.length === 0 ? (
                <div className="coach-checkins-no-data">
                    <p>{selectedClient?.name || 'Este cliente'} aún no ha realizado ningún check-in.</p>
                </div>
            ) : (
                <>
                    {alerts.length > 0 && (
                        <section className="coach-checkins-alerts">
                            <h2 className="section-title">Alertas</h2>
                            <div className="alerts-list">
                                {alerts.map((alert, index) => (
                                    <div key={index} className={`alert-item alert-${alert.type}`}>
                                        <FiAlertTriangle className="alert-icon" />
                                        <span>{alert.text}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {latestCheckIn && (
                        <section className="coach-checkins-latest">
                            <h2 className="section-title">Último Check-In ({formatDate(latestCheckIn.created_at)})</h2>
                            <CheckInDetailBlock checkIn={latestCheckIn} />
                        </section>
                    )}

                    {chartData.length > 1 && (
                        <section className="coach-checkins-charts">
                            <h2 className="section-title">Evolución temporal</h2>

                            <div className="charts-grid">
                                <LineChart title="Adherencia" data={chartData} lines={adherenceLines} showControls={true} />
                                <LineChart title="Bienestar" data={chartData} lines={wellbeingLines} showControls={true} />
                                <LineChart title="Rendimiento" data={chartData} lines={performanceLines} />
                            </div>
                        </section>
                    )}

                    <section className="coach-checkins-history">
                        <h2 className="section-title">Historial completo</h2>
                        <div className="history-cards">
                            {checkIns.map((checkIn, index) => (
                                <div key={checkIn.id} className={`history-card ${expandedCards[index] ? 'expanded' : ''}`}>
                                    <div className="history-card-header" onClick={() => toggleCard(index)}>
                                        <div className="history-card-summary">
                                            <span className="history-date">{formatDate(checkIn.created_at)}</span>
                                            <div className="history-indicators">
                                                <span className={`indicator ${getAdherenceClass(ADHERENCE_MAP[checkIn.diet_adherence])}`} title="Dieta">
                                                    D
                                                </span>
                                                <span className={`indicator ${getAdherenceClass(ADHERENCE_MAP[checkIn.training_adherence])}`} title="Entrenamiento">
                                                    E
                                                </span>
                                                <span className={`indicator ${getAdherenceClass(checkIn.rest_quality * 10)}`} title="Descanso">
                                                    {checkIn.rest_quality}
                                                </span>
                                                <span className={`indicator ${getAdherenceClass(checkIn.energy_level * 10)}`} title="Energía">
                                                    {checkIn.energy_level}
                                                </span>
                                            </div>
                                        </div>
                                        {expandedCards[index] ? <FiChevronUp /> : <FiChevronDown />}
                                    </div>
                                    {expandedCards[index] && <CheckInDetailBlock checkIn={checkIn} compact />}
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}

export default CoachCheckIns;

import { useState, useEffect } from 'react';
import LineChart from '../../components/complex/LineChart/LineChart.jsx';
import Spinner from '../../components/primitives/Spinner/Spinner.jsx';
import { coachCheckInService } from '../../services/coachCheckInService.js';
import { generateCoachAlerts } from '../../utils/coachCheckInStats.js';
import { formatDate } from '../../utils/data.js';
import { FiAlertTriangle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './CoachCheckIns.css';

const ADHERENCE_MAP = {
    'Totalmente': 100,
    'Parcialmente': 50,
    'Nada': 0,
};

const getAdherenceClass = (value) => {
    if (value >= 80) return 'adherence-high';
    if (value >= 50) return 'adherence-medium';
    return 'adherence-low';
};

const buildChartData = (checkIns) => {
    if (!checkIns || checkIns.length === 0) return [];

    return [...checkIns]
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map((ci) => {
            const date = new Date(ci.created_at);
            return {
                date: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
                diet: ADHERENCE_MAP[ci.diet_adherence] ?? null,
                training: ADHERENCE_MAP[ci.training_adherence] ?? null,
                rest: ci.rest_quality !== null ? Number(ci.rest_quality) : null,
                energy: ci.energy_level !== null ? Number(ci.energy_level) : null,
                hunger: ci.hunger_level !== null ? Number(ci.hunger_level) : null,
                gymPerformance: ci.gym_performance !== null ? Number(ci.gym_performance) : null,
            };
        });
};

function CoachCheckIns() {
    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [checkIns, setCheckIns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingCheckIns, setLoadingCheckIns] = useState(false);
    const [error, setError] = useState(null);
    const [expandedCards, setExpandedCards] = useState({});

    useEffect(() => {
        const loadClients = async () => {
            try {
                setLoading(true);
                const clientsData = await coachCheckInService.getClients();
                setClients(clientsData);
                if (clientsData.length > 0) {
                    setSelectedClientId(clientsData[0].id);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadClients();
    }, []);

    useEffect(() => {
        if (!selectedClientId) return;

        const loadCheckIns = async () => {
            try {
                setLoadingCheckIns(true);
                const data = await coachCheckInService.getClientCheckIns(selectedClientId);
                setCheckIns(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoadingCheckIns(false);
            }
        };

        loadCheckIns();
    }, [selectedClientId]);

    const toggleCard = (index) => {
        setExpandedCards(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const selectedClient = clients.find(c => c.id === selectedClientId);
    const latestCheckIn = checkIns.length > 0 ? checkIns[0] : null;
    const alerts = generateCoachAlerts(checkIns);
    const chartData = buildChartData(checkIns);

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

            <div className="coach-checkins-client-selector">
                <label htmlFor="client-select">Selecciona un cliente:</label>
                <select
                    id="client-select"
                    value={selectedClientId || ''}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                >
                    {clients.map(client => (
                        <option key={client.id} value={client.id}>
                            {client.name ? `${client.name} ${client.surname || ''}` : client.user_id}
                        </option>
                    ))}
                </select>
            </div>

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

                            <div className="checkin-blocks">
                                <div className="checkin-block">
                                    <h3 className="block-title">Adherencia y cumplimiento</h3>
                                    <div className="block-content">
                                        <div className="checkin-field">
                                            <span className="field-label">Dieta:</span>
                                            <span className={`field-value ${getAdherenceClass(ADHERENCE_MAP[latestCheckIn.diet_adherence])}`}>
                                                {latestCheckIn.diet_adherence}
                                            </span>
                                        </div>
                                        {latestCheckIn.diet_adherence_reason && (
                                            <div className="checkin-field reason">
                                                <span className="field-label">Motivo:</span>
                                                <span className="field-value">{latestCheckIn.diet_adherence_reason}</span>
                                            </div>
                                        )}
                                        <div className="checkin-field">
                                            <span className="field-label">Entrenamiento:</span>
                                            <span className={`field-value ${getAdherenceClass(ADHERENCE_MAP[latestCheckIn.training_adherence])}`}>
                                                {latestCheckIn.training_adherence}
                                            </span>
                                        </div>
                                        {latestCheckIn.training_adherence_reason && (
                                            <div className="checkin-field reason">
                                                <span className="field-label">Motivo:</span>
                                                <span className="field-value">{latestCheckIn.training_adherence_reason}</span>
                                            </div>
                                        )}
                                        <div className="checkin-field">
                                            <span className="field-label">Cardio:</span>
                                            <span className="field-value">{latestCheckIn.cardio_adherence}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="checkin-block">
                                    <h3 className="block-title">Rendimiento deportivo</h3>
                                    <div className="block-content">
                                        <div className="checkin-field">
                                            <span className="field-label">Rendimiento gym:</span>
                                            <span className="field-value">{latestCheckIn.gym_performance}/5</span>
                                        </div>
                                        {latestCheckIn.avg_daily_steps && (
                                            <div className="checkin-field">
                                                <span className="field-label">Pasos diarios:</span>
                                                <span className="field-value">{latestCheckIn.avg_daily_steps}</span>
                                            </div>
                                        )}
                                        {latestCheckIn.next_week_goal && (
                                            <div className="checkin-field">
                                                <span className="field-label">Objetivo próxima semana:</span>
                                                <span className="field-value">{latestCheckIn.next_week_goal}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="checkin-block">
                                    <h3 className="block-title">Bienestar y recuperación</h3>
                                    <div className="block-content">
                                        <div className="checkin-field">
                                            <span className="field-label">Descanso:</span>
                                            <span className="field-value">{latestCheckIn.rest_quality}/10</span>
                                        </div>
                                        {latestCheckIn.avg_sleep_hours && (
                                            <div className="checkin-field">
                                                <span className="field-label">Horas de sueño:</span>
                                                <span className="field-value">{latestCheckIn.avg_sleep_hours}h</span>
                                            </div>
                                        )}
                                        <div className="checkin-field">
                                            <span className="field-label">Energía:</span>
                                            <span className="field-value">{latestCheckIn.energy_level}/10</span>
                                        </div>
                                        <div className="checkin-field">
                                            <span className="field-label">Hambre:</span>
                                            <span className="field-value">{latestCheckIn.hunger_level}/10</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="checkin-block">
                                    <h3 className="block-title">Feedback subjetivo</h3>
                                    <div className="block-content">
                                        <div className="checkin-field">
                                            <span className="field-label">¿Cómo te has sentido?</span>
                                            <p className="field-value text-block">{latestCheckIn.how_do_you_feel}</p>
                                        </div>
                                        {latestCheckIn.comments && (
                                            <div className="checkin-field">
                                                <span className="field-label">Comentarios:</span>
                                                <p className="field-value text-block">{latestCheckIn.comments}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {chartData.length > 1 && (
                        <section className="coach-checkins-charts">
                            <h2 className="section-title">Evolución temporal</h2>

                            <div className="charts-grid">
                                {adherenceLines.length > 0 && (
                                    <LineChart title="Adherencia" data={chartData} lines={adherenceLines} showControls={true} />
                                )}
                                {wellbeingLines.length > 0 && (
                                    <LineChart title="Bienestar" data={chartData} lines={wellbeingLines} showControls={true} />
                                )}
                                {performanceLines.length > 0 && (
                                    <LineChart title="Rendimiento" data={chartData} lines={performanceLines} />
                                )}
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
                                    {expandedCards[index] && (
                                        <div className="history-card-content">
                                            <div className="history-detail">
                                                <span className="detail-label">Dieta:</span>
                                                <span>{checkIn.diet_adherence}</span>
                                            </div>
                                            {checkIn.diet_adherence_reason && (
                                                <div className="history-detail reason">
                                                    <span className="detail-label">Motivo dieta:</span>
                                                    <span>{checkIn.diet_adherence_reason}</span>
                                                </div>
                                            )}
                                            <div className="history-detail">
                                                <span className="detail-label">Entrenamiento:</span>
                                                <span>{checkIn.training_adherence}</span>
                                            </div>
                                            {checkIn.training_adherence_reason && (
                                                <div className="history-detail reason">
                                                    <span className="detail-label">Motivo entreno:</span>
                                                    <span>{checkIn.training_adherence_reason}</span>
                                                </div>
                                            )}
                                            <div className="history-detail">
                                                <span className="detail-label">Cardio:</span>
                                                <span>{checkIn.cardio_adherence}</span>
                                            </div>
                                            <div className="history-detail">
                                                <span className="detail-label">Rendimiento gym:</span>
                                                <span>{checkIn.gym_performance}/5</span>
                                            </div>
                                            {checkIn.avg_daily_steps && (
                                                <div className="history-detail">
                                                    <span className="detail-label">Pasos diarios:</span>
                                                    <span>{checkIn.avg_daily_steps}</span>
                                                </div>
                                            )}
                                            <div className="history-detail">
                                                <span className="detail-label">Descanso:</span>
                                                <span>{checkIn.rest_quality}/10</span>
                                            </div>
                                            {checkIn.avg_sleep_hours && (
                                                <div className="history-detail">
                                                    <span className="detail-label">Horas sueño:</span>
                                                    <span>{checkIn.avg_sleep_hours}h</span>
                                                </div>
                                            )}
                                            <div className="history-detail">
                                                <span className="detail-label">Energía:</span>
                                                <span>{checkIn.energy_level}/10</span>
                                            </div>
                                            <div className="history-detail">
                                                <span className="detail-label">Hambre:</span>
                                                <span>{checkIn.hunger_level}/10</span>
                                            </div>
                                            <div className="history-detail text-detail">
                                                <span className="detail-label">Cómo te has sentido:</span>
                                                <p>{checkIn.how_do_you_feel}</p>
                                            </div>
                                            {checkIn.comments && (
                                                <div className="history-detail text-detail">
                                                    <span className="detail-label">Comentarios:</span>
                                                    <p>{checkIn.comments}</p>
                                                </div>
                                            )}
                                            {checkIn.next_week_goal && (
                                                <div className="history-detail text-detail">
                                                    <span className="detail-label">Objetivo próxima semana:</span>
                                                    <p>{checkIn.next_week_goal}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
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

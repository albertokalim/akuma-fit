import { useState, useEffect } from 'react';
import StatCard from '../../components/complex/StatCard/StatCard.jsx';
import EventList from '../../components/complex/EventList/EventList.jsx';
import Spinner from '../../components/primitives/Spinner/Spinner.jsx';
import { FiUsers, FiCheckCircle } from 'react-icons/fi';
import { dashboardService } from '../../services/dashboardService.js';


/**
 * Dashboard del coach: tarjetas con clientes activos y check-ins de la semana,
 * y lista de últimos check-ins.
 */
function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ activeClients: 0, weeklyCheckIns: 0 });
    const [recentCheckIns, setRecentCheckIns] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsData, checkInsData] = await Promise.all([
                    dashboardService.getStats(),
                    dashboardService.getRecentCheckIns()
                ]);
                setStats(statsData);
                setRecentCheckIns(checkInsData);
            } catch (err) {
                console.error('Error loading dashboard:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return <Spinner text="Cargando dashboard..." />;
    }

    const statsCards = [
        { value: stats.activeClients, label: 'Clientes activos', icon: <FiUsers /> },
        { value: stats.weeklyCheckIns, label: 'Check-ins esta semana', icon: <FiCheckCircle /> },
    ];

    return (
        <div className="dashboard-main">
            <div className="dashboard-title">
                <h1>Dashboard</h1>
            </div>

            <section className="stats-section">
                <div className="stats-grid">
                    {statsCards.map((stat, index) => (
                        <StatCard key={index} value={stat.value} label={stat.label} icon={stat.icon} />
                    ))}
                </div>
            </section>

            <section className="events-section">
                <EventList title="Últimos check-ins" items={recentCheckIns} />
            </section>
        </div>
    );
}

export default Dashboard;

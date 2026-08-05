import StatCard from '../../components/complex/StatCard/StatCard.jsx';
import EventList from '../../components/complex/EventList/EventList.jsx';
import LineChart from '../../components/complex/LineChart/LineChart.jsx';
import { FiUsers, FiClipboard, FiCheckCircle } from 'react-icons/fi';
import { GiWeightLiftingUp } from 'react-icons/gi';
import './Dashboard.css';

// NOTA: estos datos son de ejemplo (no vienen de Supabase todavía), a
// diferencia del resto de vistas que sí consultan datos reales. Pendiente
// de conectar a un servicio real de estadísticas/eventos del coach.
function Dashboard() {
    const stats = [
        { value: '24', label: 'Clientes activos', icon: <FiUsers /> },
        { value: '31', label: 'Planes activos', icon: <FiClipboard /> },
        { value: '18', label: 'Check-ins esta semana', icon: <FiCheckCircle /> },
        { value: '5', label: 'Entrenamientos hoy', icon: <GiWeightLiftingUp /> },
    ];

    const upcomingEvents = [
        { text: 'Sesión Juan López', time: '14:30' },
        { text: 'Check-in María García', time: '16:00' },
        { text: 'Plan nueva cliente', time: '17:30' },
    ];

    const expiringPlans = [
        { text: 'Plan Carlos - Vence en 3 días', time: '18/07' },
        { text: 'Plan Laura - Vence en 5 días', time: '20/07' },
        { text: 'Plan Pedro - Vence en 7 días', time: '22/07' },
    ];

    return (
        <div className="dashboard-main">
            <div className="dashboard-title">
                <h1>Dashboard</h1>
            </div>

            {/* Stats Cards */}
            <section className="stats-section">
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <StatCard key={index} value={stat.value} label={stat.label} icon={stat.icon} />
                    ))}
                </div>
            </section>

            {/* Chart and Events */}
            <section className="chart-events-section">
                <div className="chart-container">
                    <LineChart title="Evolución Mensual" data={[]} lines={[]} />
                </div>
                <div className="events-container">
                    <EventList title="Próximos eventos" items={upcomingEvents} />
                    <EventList title="Planes próximos a vencer" items={expiringPlans} />
                </div>
            </section>
        </div>
    );
}

export default Dashboard;

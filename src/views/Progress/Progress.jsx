import { useState, useEffect } from 'react';
import LineChart from '../../components/complex/LineChart/LineChart.jsx';
import Button from '../../components/primitives/Button/Button.jsx';
import { supabase } from '../../supabaseClient.js';
import WeightLogForm from '../WeightLogForm/WeightLogForm.jsx';
import './Progress.css';

const MEASUREMENT_OPTIONS = [
    { key: 'weight', label: 'Peso (kg)', color: '#a78bfa' },
    { key: 'chest', label: 'Pecho (cm)', color: '#4ade80' },
    { key: 'waist', label: 'Cintura (cm)', color: '#f87171' },
    { key: 'hip', label: 'Cadera (cm)', color: '#60a5fa' },
];

function Progress() {
    const [measurements, setMeasurements] = useState([]);
    const [selectedMeasures, setSelectedMeasures] = useState(['weight']);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);

    const loadMeasurements = async () => {
        try {
            const { data: authData, error: authError } = await supabase.auth.getUser();

            if (authError || !authData?.user) {
                throw new Error('Debes iniciar sesión para ver tu progreso.');
            }

            const { data: profile, error: profileError } = await supabase
                .from('profile')
                .select('id')
                .eq('user', authData.user.id)
                .maybeSingle();

            if (profileError) {
                throw new Error(`No se pudo comprobar el perfil: ${profileError.message}`);
            }

            if (!profile) {
                setMeasurements([]);
                setLoading(false);
                return;
            }

            const { data: measurementsData, error: fetchError } = await supabase
                .from('measurement')
                .select('*')
                .eq('profile_id', profile.id)
                .order('created_at', { ascending: true });

            if (fetchError) {
                throw new Error(`No se pudieron cargar las mediciones: ${fetchError.message}`);
            }

            setMeasurements(measurementsData || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMeasurements();
    }, []);

    const handleFormComplete = () => {
        setShowForm(false);
        loadMeasurements();
    };

    const toggleMeasure = (key) => {
        setSelectedMeasures((prev) =>
            prev.includes(key)
                ? prev.filter((k) => k !== key)
                : [...prev, key]
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
        });
    };

    const chartData = measurements.map((m) => {
        const point = { date: formatDate(m.created_at) };
        MEASUREMENT_OPTIONS.forEach((opt) => {
            if (m[opt.key] !== null && m[opt.key] !== undefined) {
                point[opt.key] = Number(m[opt.key]);
            }
        });
        return point;
    });

    const activeLines = MEASUREMENT_OPTIONS
        .filter((opt) => selectedMeasures.includes(opt.key))
        .map((opt) => ({
            dataKey: opt.key,
            name: opt.label,
            color: opt.color,
        }));

    if (showForm) {
        return <WeightLogForm onComplete={handleFormComplete} onCancel={() => setShowForm(false)} />;
    }

    return (
        <div className="progress">
            <h1 className="progress-title">Progreso</h1>
            <p className="progress-description">Visualiza la evolución de tus medidas a lo largo del tiempo.</p>

            {loading && <div className="progress-loading">Cargando mediciones...</div>}
            {error && <div className="error-message">{error}</div>}

            {!loading && !error && measurements.length === 0 && (
                <div className="progress-empty">
                    <p>Aún no has registrado ninguna medición.</p>
                    <p>¡Registra tu primera medición para empezar a ver tu progreso!</p>
                </div>
            )}

            {!loading && !error && measurements.length > 0 && (
                <>
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

            <Button
                text="Registrar Peso"
                onClick={() => setShowForm(true)}
                className="progress-fab"
            />
        </div>
    );
}

export default Progress;
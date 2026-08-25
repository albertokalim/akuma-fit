import { useState } from 'react';
import LineChart from '../../components/complex/LineChart/LineChart.jsx';
import DataTable from '../../components/complex/DataTable/DataTable.jsx';
import StatCard from '../../components/complex/StatCard/StatCard.jsx';
import PhotoGallery from '../../components/complex/PhotoGallery/PhotoGallery.jsx';
import PhotoCompare from '../../components/complex/PhotoCompare/PhotoCompare.jsx';
import Spinner from '../../components/primitives/Spinner/Spinner.jsx';
import ColorSwatch from '../../components/primitives/ColorSwatch/ColorSwatch.jsx';
import ClientSelector from '../../components/complex/ClientSelector/ClientSelector.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { coachReportService } from '../../services/coachReportService.js';
import { MEASUREMENT_OPTIONS } from '../../config/measurementOptions.js';
import { buildChartData, buildActiveLines, calculateDelta } from '../../utils/chartData.js';
import { formatDate } from '../../utils/data.js';
import { FiActivity, FiCamera, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';


/**
 * Vista de reportes del coach: medidas corporales (gráficos, deltas y tabla)
 * y fotos (galería y comparador) de un cliente.
 */
function Reports() {
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [selectedMeasures, setSelectedMeasures] = useState(['weight']);
    const [activeTab, setActiveTab] = useState('measurements');

    const { data: clients, loading, error: clientsError } = useAsyncData(
        () => coachReportService.getClients().then((data) => {
            if (data.length > 0) setSelectedClientId((prev) => prev ?? data[0].id);
            return data;
        }),
        []
    );

    const { data: reportData, loading: loadingData, error: dataError } = useAsyncData(
        selectedClientId
            ? () => Promise.all([
                coachReportService.getMeasurements(selectedClientId),
                coachReportService.getPhotos(selectedClientId),
            ]).then(([measurements, photos]) => ({ measurements, photos }))
            : null,
        [selectedClientId],
        { measurements: [], photos: [] }
    );

    const { measurements, photos } = reportData;
    const error = clientsError || dataError;

    const toggleMeasure = (key) => {
        setSelectedMeasures((prev) =>
            prev.includes(key)
                ? prev.filter((k) => k !== key)
                : [...prev, key]
        );
    };

    const chartData = buildChartData(measurements, MEASUREMENT_OPTIONS);
    const activeLines = buildActiveLines(MEASUREMENT_OPTIONS, selectedMeasures);

    const weightDelta = calculateDelta(measurements, 'weight');
    const waistDelta = calculateDelta(measurements, 'waist');

    const getCurrentWeight = () => {
        const last = [...measurements].reverse().find(m => m.weight !== null && m.weight !== undefined);
        return last ? `${last.weight} kg` : '-';
    };

    const getCurrentWaist = () => {
        const last = [...measurements].reverse().find(m => m.waist !== null && m.waist !== undefined);
        return last ? `${last.waist} cm` : '-';
    };

    const getDeltaIcon = (delta) => {
        if (delta === null) return null;
        return delta > 0 ? <FiTrendingUp /> : delta < 0 ? <FiTrendingDown /> : null;
    };

    const tableColumns = [
        { key: 'created_at', label: 'Fecha', render: (value) => formatDate(value) },
        { key: 'weight', label: 'Peso (kg)', render: (value) => value !== null ? value : '-' },
        { key: 'chest', label: 'Pecho (cm)', render: (value) => value !== null ? value : '-' },
        { key: 'waist', label: 'Cintura (cm)', render: (value) => value !== null ? value : '-' },
        { key: 'hip', label: 'Cadera (cm)', render: (value) => value !== null ? value : '-' },
    ];

    if (loading) {
        return <Spinner text="Cargando clientes..." />;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (clients.length === 0) {
        return (
            <div className="reports">
                <h1 className="reports-title">Reportes</h1>
                <div className="reports-empty">
                    <p>No tienes clientes asignados.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="reports">
            <h1 className="reports-title">Reportes</h1>

            <ClientSelector
                clients={clients}
                selectedClientId={selectedClientId}
                onChange={setSelectedClientId}
                className="reports-client-selector"
            />

            {loadingData ? (
                <Spinner text="Cargando datos..." />
            ) : (
                <>
                    <div className="reports-tabs">
                        <button
                            className={`tab-button ${activeTab === 'measurements' ? 'active' : ''}`}
                            onClick={() => setActiveTab('measurements')}
                        >
                            <FiActivity />
                            <span>Medidas Corporales</span>
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'photos' ? 'active' : ''}`}
                            onClick={() => setActiveTab('photos')}
                        >
                            <FiCamera />
                            <span>Fotos Corporales</span>
                        </button>
                    </div>

                    {activeTab === 'measurements' && (
                        <div className="reports-measurements">
                            {measurements.length === 0 ? (
                                <div className="reports-empty">
                                    <p>Este cliente aún no ha registrado mediciones.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="stats-grid">
                                        <StatCard
                                            value={getCurrentWeight()}
                                            label="Peso actual"
                                            icon={<FiActivity />}
                                        />
                                        {weightDelta !== null && (
                                            <StatCard
                                                value={`${weightDelta > 0 ? '+' : ''}${weightDelta} kg`}
                                                label="Delta peso"
                                                icon={getDeltaIcon(weightDelta)}
                                            />
                                        )}
                                        <StatCard
                                            value={getCurrentWaist()}
                                            label="Cintura actual"
                                            icon={<FiActivity />}
                                        />
                                        {waistDelta !== null && (
                                            <StatCard
                                                value={`${waistDelta > 0 ? '+' : ''}${waistDelta} cm`}
                                                label="Delta cintura"
                                                icon={getDeltaIcon(waistDelta)}
                                            />
                                        )}
                                    </div>

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

                                    {selectedMeasures.length > 0 && chartData.length > 0 && (
                                        <LineChart
                                            title="Evolución de medidas"
                                            data={chartData}
                                            lines={activeLines}
                                        />
                                    )}

                                    <div className="measurements-table">
                                        <h3 className="table-title">Historial de mediciones</h3>
                                        <DataTable
                                            columns={tableColumns}
                                            data={[...measurements].reverse()}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'photos' && (
                        <div className="reports-photos">
                            {photos.length === 0 ? (
                                <div className="reports-empty">
                                    <p>Este cliente aún no ha registrado fotos.</p>
                                </div>
                            ) : (
                                <>
                                    <section className="photos-section">
                                        <h2 className="section-title">Galería de fotos</h2>
                                        <PhotoGallery photos={photos} />
                                    </section>

                                    <section className="photos-section">
                                        <h2 className="section-title">Comparador antes/después</h2>
                                        <PhotoCompare photos={photos} />
                                    </section>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Reports;

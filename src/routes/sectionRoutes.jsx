import Dashboard from '../views/Dashboard/Dashboard.jsx';
import CheckIn from '../views/CheckIn/CheckIn.jsx';
import NewCheckIn from '../views/CheckIn/NewCheckIn.jsx';
import Progress from '../views/Progress/Progress.jsx';
import NewWeightLog from '../views/Progress/NewWeightLog.jsx';
import ProgressBodyPhotos from '../views/Progress/ProgressBodyPhotos.jsx';
import CoachCheckIns from '../views/CoachCheckIns/CoachCheckIns.jsx';
import Reports from '../views/Reports/Reports.jsx';
import CreateRutine from '../views/CreateRutine/CreateRutine.jsx';
import PlaceholderComponent from '../components/primitives/PlaceholderComponent/PlaceholderComponent.jsx';

/**
 * Fuente única de verdad para el contenido de cada sección del menú.
 * `menuConfig.json` define label/icon/orden por rol; aquí se define qué
 * se renderiza para cada `id` de sección (rutas relativas a "/app").
 *
 * Cada entrada es una lista de rutas: la primera es la "principal" (a la
 * que apunta el enlace del sidebar); el resto son sub-vistas propias de
 * esa sección (p.ej. el formulario de un nuevo check-in).
 */
export const SECTION_ROUTES = {
    dashboard: [
        { path: 'dashboard', element: <Dashboard /> },
    ],
    checkin: [
        { path: 'checkin', element: <CheckIn /> },
        { path: 'checkin/new', element: <NewCheckIn /> },
    ],
    progress: [
        { path: 'progress', element: <Progress /> },
        { path: 'progress/weight', element: <NewWeightLog /> },
        { path: 'progress/photos', element: <ProgressBodyPhotos /> },
    ],
    'client-checkins': [
        { path: 'client-checkins', element: <CoachCheckIns /> },
    ],
    reportes: [
        { path: 'reportes', element: <Reports /> },
    ],
    clients: [
        { path: 'clients', element: <PlaceholderComponent title="Clientes Component" /> },
    ],
    exercises: [
        { path: 'exercises', element: <PlaceholderComponent title="Ejercicios Component" /> },
    ],
    alimentos: [
        { path: 'alimentos', element: <PlaceholderComponent title="Alimentos Component" /> },
    ],
    plans: [
        { path: 'plans', element: <CreateRutine /> },
    ],
    'my-plan': [
        { path: 'my-plan', element: <PlaceholderComponent title="Mi Plan Component" /> },
    ],
    nutrition: [
        { path: 'nutrition', element: <PlaceholderComponent title="Nutrición Component" /> },
    ],
};

/** Todas las rutas (aplanadas) de todas las secciones, para generar el <Routes>. */
export const ALL_SECTION_ROUTES = Object.values(SECTION_ROUTES).flat();

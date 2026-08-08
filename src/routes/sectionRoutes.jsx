// Este archivo es un mapa de configuración de rutas (no un componente), por lo
// que no aplica la regla de fast-refresh que exige que un archivo sólo
// exporte componentes.
/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import Spinner from '../components/primitives/Spinner/Spinner.jsx';
import PlaceholderComponent from '../components/primitives/PlaceholderComponent/PlaceholderComponent.jsx';

const Dashboard = lazy(() => import('../views/Dashboard/Dashboard.jsx'));
const CheckIn = lazy(() => import('../views/CheckIn/CheckIn.jsx'));
const NewCheckIn = lazy(() => import('../views/CheckIn/NewCheckIn.jsx'));
const Progress = lazy(() => import('../views/Progress/Progress.jsx'));
const NewWeightLog = lazy(() => import('../views/Progress/NewWeightLog.jsx'));
const ProgressBodyPhotos = lazy(() => import('../views/Progress/ProgressBodyPhotos.jsx'));
const CoachCheckIns = lazy(() => import('../views/CoachCheckIns/CoachCheckIns.jsx'));
const Reports = lazy(() => import('../views/Reports/Reports.jsx'));
const CreateRoutine = lazy(() => import('../views/CreateRoutine/CreateRoutine.jsx'));
const Exercises = lazy(() => import('../views/Exercises/Exercises.jsx'));
const ExerciseForm = lazy(() => import('../views/Exercises/ExerciseForm.jsx'));
const MyPlan = lazy(() => import('../views/MyPlan/MyPlan.jsx'));
const Session = lazy(() => import('../views/Session/Session.jsx'));

/**
 * Envuelve un elemento perezoso (`React.lazy`) en un `Suspense` con un
 * fallback consistente, para que cada carga de sección bajo demanda
 * (code-splitting) muestre un spinner en vez de quedar en blanco mientras
 * se descarga el chunk correspondiente.
 */
function withSuspense(element) {
    return <Suspense fallback={<Spinner />}>{element}</Suspense>;
}

/**
 * Fuente única de verdad para el contenido de cada sección del menú.
 * `menuConfig.json` define label/icon/orden por rol; aquí se define qué
 * se renderiza para cada `id` de sección (rutas relativas a "/app").
 *
 * Cada entrada es una lista de rutas: la primera es la "principal" (a la
 * que apunta el enlace del sidebar); el resto son sub-vistas propias de
 * esa sección (p.ej. el formulario de un nuevo check-in).
 *
 * Las vistas se cargan con `React.lazy` para dividir el bundle por
 * sección (code-splitting) en vez de incluir todas las pantallas de la
 * app en un único chunk inicial.
 */
export const SECTION_ROUTES = {
    dashboard: [
        { path: 'dashboard', element: withSuspense(<Dashboard />) },
    ],
    checkin: [
        { path: 'checkin', element: withSuspense(<CheckIn />) },
        { path: 'checkin/new', element: withSuspense(<NewCheckIn />) },
    ],
    progress: [
        { path: 'progress', element: withSuspense(<Progress />) },
        { path: 'progress/weight', element: withSuspense(<NewWeightLog />) },
        { path: 'progress/photos', element: withSuspense(<ProgressBodyPhotos />) },
    ],
    'client-checkins': [
        { path: 'client-checkins', element: withSuspense(<CoachCheckIns />) },
    ],
    reportes: [
        { path: 'reportes', element: withSuspense(<Reports />) },
    ],
    clients: [
        { path: 'clients', element: <PlaceholderComponent title="Clientes Component" /> },
    ],
    exercises: [
        { path: 'exercises', element: withSuspense(<Exercises />) },
        { path: 'exercises/new', element: withSuspense(<ExerciseForm />) },
        { path: 'exercises/:id/edit', element: withSuspense(<ExerciseForm />) },
    ],
    alimentos: [
        { path: 'alimentos', element: <PlaceholderComponent title="Alimentos Component" /> },
    ],
    plans: [
        { path: 'plans', element: withSuspense(<CreateRoutine />) },
    ],
    'my-plan': [
        { path: 'my-plan', element: withSuspense(<MyPlan />) },
    ],
    session: [
        { path: 'session', element: withSuspense(<Session />) },
    ],
    nutrition: [
        { path: 'nutrition', element: <PlaceholderComponent title="Nutrición Component" /> },
    ],
};

/** Todas las rutas (aplanadas) de todas las secciones, para generar el <Routes>. */
export const ALL_SECTION_ROUTES = Object.values(SECTION_ROUTES).flat();

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
const Foods = lazy(() => import('../views/Foods/Foods.jsx'));
const Recipes = lazy(() => import('../views/Recipes/Recipes.jsx'));
const RecipeForm = lazy(() => import('../views/Recipes/RecipeForm.jsx'));
const MealPlans = lazy(() => import('../views/MealPlans/MealPlans.jsx'));
const MealPlanEditor = lazy(() => import('../views/MealPlans/MealPlanEditor.jsx'));
const Nutrition = lazy(() => import('../views/Nutrition/Nutrition.jsx'));
const Calendar = lazy(() => import('../views/Calendar/Calendar.jsx'));
const EventCreator = lazy(() => import('../views/Calendar/EventCreator.jsx'));

 
function withSuspense(element) {
    return <Suspense fallback={<Spinner />}>{element}</Suspense>;
}

 
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
        { path: 'alimentos', element: withSuspense(<Foods />) },
    ],
    recetas: [
        { path: 'recetas', element: withSuspense(<Recipes />) },
        { path: 'recetas/new', element: withSuspense(<RecipeForm />) },
        { path: 'recetas/:id/edit', element: withSuspense(<RecipeForm />) },
    ],
    dietas: [
        { path: 'dietas', element: withSuspense(<MealPlans />) },
        { path: 'dietas/new', element: withSuspense(<MealPlanEditor />) },
        { path: 'dietas/:id/edit', element: withSuspense(<MealPlanEditor />) },
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
        { path: 'nutrition', element: withSuspense(<Nutrition />) },
    ],
    calendario: [
        { path: 'calendario', element: withSuspense(<Calendar />) },
        { path: 'calendario/nuevo', element: withSuspense(<EventCreator />) },
    ],
};

 
export const ALL_SECTION_ROUTES = Object.values(SECTION_ROUTES).flat();

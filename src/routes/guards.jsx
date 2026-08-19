import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import Spinner from '../components/primitives/Spinner/Spinner.jsx';

 
export function RequireAuth({ children, requireAssessment = false }) {
    const { status, userRole, assessmentCompleted } = useAuth();
    const location = useLocation();

    if (status === 'loading') {
        return <Spinner text="Cargando..." />;
    }

    if (status === 'signed-out') {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (requireAssessment && userRole === 'client' && !assessmentCompleted) {
        return <Navigate to="/assessment" replace />;
    }

    return children;
}

 
export function PublicOnlyRoute({ children }) {
    const { status } = useAuth();

    if (status === 'loading') {
        return <Spinner text="Cargando..." />;
    }

    if (status === 'signed-in') {
        return <Navigate to="/app" replace />;
    }

    return children;
}

 
export function RootRedirect() {
    const { status, userRole, assessmentCompleted } = useAuth();

    if (status === 'loading') {
        return <Spinner text="Cargando..." />;
    }

    if (status === 'signed-out') {
        return <Navigate to="/login" replace />;
    }

    if (userRole === 'client' && !assessmentCompleted) {
        return <Navigate to="/assessment" replace />;
    }

    return <Navigate to="/app" replace />;
}

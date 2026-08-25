import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';
import Spinner from '../components/primitives/Spinner/Spinner.jsx';

/**
 * Protege rutas que requieren sesión iniciada. Si `requireAssessment` es
 * `true`, obliga a los clientes que no han completado la valoración inicial a
 * pasar antes por `/assessment`.
 *
 * @param {Object} props - Props del guard.
 * @param {React.ReactNode} props.children - Contenido protegido.
 * @param {boolean} [props.requireAssessment=false] - Exigir valoración inicial a clientes.
 */
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

/**
 * Protege rutas que solo tienen sentido para usuarios no autenticados
 * (login/registro). Si ya hay sesión, redirige a la app.
 *
 * @param {Object} props - Props del guard.
 * @param {React.ReactNode} props.children - Contenido protegido.
 */
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

/**
 * Redirige la raíz `/` al destino correcto según el estado de sesión y
 * valoración del usuario (login, valoración inicial o la app).
 */
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

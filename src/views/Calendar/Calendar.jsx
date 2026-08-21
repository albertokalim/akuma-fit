import { useAuth } from '../../context/useAuth.js';
import ClientCalendar from './ClientCalendar.jsx';
import CoachCalendar from './CoachCalendar.jsx';

/**
 * Punto de entrada de la sección Calendario. Según el rol del usuario
 * autenticado renderiza la vista de cliente o la de coach.
 */
function Calendar() {
    const { userRole } = useAuth();

    return userRole === 'coach' ? <CoachCalendar /> : <ClientCalendar />;
}

export default Calendar;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from '../../components/complex/Calendar/Calendar.jsx';
import Spinner from '../../components/primitives/Spinner/Spinner.jsx';
import EventDetailModal from './EventDetailModal.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { useAuth } from '../../context/useAuth.js';
import { useSession } from '../../context/useSession.js';
import { eventService } from '../../services/eventService.js';
import { expandOccurrences, completionRange } from '../../utils/calendar.js';

/**
 * Calendario del cliente (caso de uso 1).
 *
 * Muestra los eventos asignados al usuario autenticado y resuelve el click
 * según el tipo de evento:
 * - `measurement` -> formulario de mediciones.
 * - `check_in` -> formulario de check-in.
 * - `photos` -> subida de fotos corporales.
 * - `training` -> inicia sesión de entrenamiento con la rutina del evento.
 * - `info` -> modal informativo.
 */
function ClientCalendar() {
    const navigate = useNavigate();
    const { profileId } = useAuth();
    const { activeSession, startSession } = useSession();

    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    const [infoEvent, setInfoEvent] = useState(null);
    const [actionError, setActionError] = useState(null);

    const { data: eventData, loading, error } = useAsyncData(
        profileId ? () => eventService.getByClient(profileId) : null,
        [profileId]
    );

    const { data: completions } = useAsyncData(
        profileId ? () => eventService.getCompletions(profileId, completionRange(year, month)) : null,
        [profileId, year, month]
    );

    const events = eventData?.events ?? [];
    const exceptions = eventData?.exceptions ?? [];
    const occurrences = expandOccurrences(events, exceptions, year, month);

    const goPrev = () => {
        if (month === 0) {
            setMonth(11);
            setYear((y) => y - 1);
        } else {
            setMonth((m) => m - 1);
        }
    };

    const goNext = () => {
        if (month === 11) {
            setMonth(0);
            setYear((y) => y + 1);
        } else {
            setMonth((m) => m + 1);
        }
    };

    const handleTraining = async (event) => {
        setActionError(null);

        if (activeSession) {
            navigate('/app/session');
            return;
        }

        try {
            await startSession({ id: event.routine_id, title: event.routine?.title || 'Entrenamiento' });
            navigate('/app/session');
        } catch (err) {
            setActionError(err.message);
        }
    };

    const handleEventClick = (occ) => {
        const { event } = occ;
        setActionError(null);

        switch (event.event_type) {
            case 'measurement':
                navigate('/app/progress/weight');
                break;
            case 'check_in':
                navigate('/app/checkin/new');
                break;
            case 'photos':
                navigate('/app/progress/photos');
                break;
            case 'training':
                handleTraining(event);
                break;
            case 'info':
                setInfoEvent(occ);
                break;
            default:
                break;
        }
    };

    if (loading) {
        return <Spinner text="Cargando calendario..." />;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="calendar-page">
            <div className="page-container">
                <h1 className="page-title">Calendario</h1>
                <p className="page-description">Tus eventos y tareas programadas.</p>

                {actionError && <div className="error-message">{actionError}</div>}

                <Calendar
                    year={year}
                    month={month}
                    occurrences={occurrences}
                    completions={completions}
                    onEventClick={handleEventClick}
                    onPrevMonth={goPrev}
                    onNextMonth={goNext}
                />
            </div>

            {infoEvent && (
                <EventDetailModal occurrence={infoEvent} onClose={() => setInfoEvent(null)} />
            )}
        </div>
    );
}

export default ClientCalendar;

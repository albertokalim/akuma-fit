import { FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';
import { buildMonthGrid, isEventCompleted, MONTH_NAMES } from '../../../utils/calendar.js';

/**
 * Cabecera de los días de la semana (semana ISO empezando en lunes).
 */
const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/** Clase CSS por tipo de evento para colorear cada chip del calendario. */
const TYPE_CLASS = {
    measurement: 'calendar-event--measurement',
    check_in: 'calendar-event--checkin',
    training: 'calendar-event--training',
    photos: 'calendar-event--photos',
    info: 'calendar-event--info',
};

/**
 * Calendario mensual controlado. Renderiza una parrilla de 7 columnas
 * (lunes a domingo) con los chips de eventos de cada día.
 *
 * Es un componente "tonto": no conoce el origen de los datos; recibe las
 * ocurrencias ya expandidas y los callbacks de navegación/click del padre.
 *
 * @param {Object} props
 * @param {number} props.year - Año visible.
 * @param {number} props.month - Mes visible (0-indexado).
 * @param {Array<{date: string, event: Object}>} props.occurrences - Ocurrencias.
 * @param {Object} props.completions - Estado "hecho" (ver `buildCompletions`).
 * @param {(occ: Object) => void} props.onEventClick - Click en un evento.
 * @param {() => void} props.onPrevMonth - Ir al mes anterior.
 * @param {() => void} props.onNextMonth - Ir al mes siguiente.
 */
function Calendar({ year, month, occurrences, completions, onEventClick, onPrevMonth, onNextMonth }) {
    const weeks = buildMonthGrid(year, month);

    const eventsByDay = {};
    occurrences.forEach((occ) => {
        const day = Number(occ.date.slice(8, 10));
        if (!eventsByDay[day]) eventsByDay[day] = [];
        eventsByDay[day].push(occ);
    });

    return (
        <div className="calendar">
            <div className="calendar-header">
                <button type="button" className="calendar-nav-btn" onClick={onPrevMonth} aria-label="Mes anterior">
                    <FiChevronLeft />
                </button>
                <h2 className="calendar-month">{MONTH_NAMES[month]} {year}</h2>
                <button type="button" className="calendar-nav-btn" onClick={onNextMonth} aria-label="Mes siguiente">
                    <FiChevronRight />
                </button>
            </div>

            <div className="calendar-grid calendar-weekdays-row">
                {WEEKDAY_LABELS.map((label) => (
                    <div key={label} className="calendar-weekday">{label}</div>
                ))}
            </div>

            <div className="calendar-grid">
                {weeks.flat().map((day, index) => {
                    if (day === null) {
                        return <div key={`empty-${index}`} className="calendar-day calendar-day-empty" />;
                    }

                    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayEvents = eventsByDay[day] || [];

                    return (
                        <div key={iso} className="calendar-day">
                            <span className="calendar-day-number">{day}</span>
                            <div className="calendar-events">
                                {dayEvents.map((occ, idx) => {
                                    const done = isEventCompleted(occ.date, occ.event, completions);
                                    const typeClass = TYPE_CLASS[occ.event.event_type] || '';

                                    return (
                                        <button
                                            key={`${occ.date}-${idx}`}
                                            type="button"
                                            className={`calendar-event ${typeClass} ${done ? 'calendar-event-done' : ''}`}
                                            onClick={() => onEventClick(occ)}
                                        >
                                            <span className="calendar-event-title">{occ.event.title}</span>
                                            {occ.event.start_time && (
                                                <span className="calendar-event-time">{occ.event.start_time.slice(0, 5)}</span>
                                            )}
                                            {done && <FiCheck className="calendar-event-check" size={12} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Calendar;

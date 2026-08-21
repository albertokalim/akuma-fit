/**
 * Utilidades de calendario y motor de recurrencia.
 *
 * Implementa un subconjunto de la semántica de RFC 5545 (iCalendar):
 * - RRULE (`FREQ` semanal/mensual/anual + `INTERVAL` + `BYDAY`/`BYMONTHDAY`/
 *   `BYMONTH` + `COUNT`/`UNTIL`) sobre eventos "maestros".
 * - EXDATE y RECURRENCE-ID mediante la tabla de excepciones
 *   (`calendar_event_exception`), que permite cancelar o modificar una
 *   ocurrencia concreta de una serie.
 *
 * Las fechas se manejan como cadenas `YYYY-MM-DD` en hora local para evitar
 * las ambigüedades de zona horaria de `Date` al parsear fechas.
 */

/** Días de la semana en orden ISO (lunes=1 ... domingo=7). */
export const WEEKDAYS = [
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
    { value: 7, label: 'Domingo' },
];

/** Nombres de los meses (índice 0..11) para mostrar en el calendario. */
export const MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const pad = (n) => String(n).padStart(2, '0');

/**
 * Convierte un `Date` a su fecha local en formato `YYYY-MM-DD`.
 *
 * @param {Date} date - Fecha a convertir.
 * @returns {string} Fecha ISO en hora local.
 */
export const toISODate = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/**
 * Convierte una fecha `YYYY-MM-DD` a un `Date` en hora local (medianoche).
 *
 * @param {string} iso - Fecha en formato `YYYY-MM-DD`.
 * @returns {Date} `Date` local correspondiente a la medianoche de esa fecha.
 */
export const fromISODate = (iso) => {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
};

/**
 * Devuelve el día de la semana ISO (lunes=1 ... domingo=7) de un `Date`.
 *
 * @param {Date} date - Fecha de la que obtener el día de la semana.
 * @returns {number} Día de la semana ISO (1..7).
 */
export const toISOWeekday = (date) => (date.getDay() === 0 ? 7 : date.getDay());

/**
 * Suma (o resta) días a una fecha sin mutar la original.
 *
 * @param {Date} date - Fecha base.
 * @param {number} days - Número de días a sumar (puede ser negativo).
 * @returns {Date} Nueva fecha desplazada.
 */
export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/**
 * Número de días del mes indicado (`month0` es 0-indexado).
 *
 * @param {number} year - Año.
 * @param {number} month0 - Mes 0-indexado (0=enero ... 11=diciembre).
 * @returns {number} Número de días del mes.
 */
export const daysInMonth = (year, month0) => new Date(year, month0 + 1, 0).getDate();

/**
 * Lunes (fecha ISO) de la semana que contiene la fecha indicada.
 *
 * @param {string} iso - Fecha en formato `YYYY-MM-DD`.
 * @returns {string} Fecha ISO del lunes de esa semana.
 */
export const weekStartMonday = (iso) => {
    const d = fromISODate(iso);
    return toISODate(addDays(d, -(toISOWeekday(d) - 1)));
};

/**
 * Eventos fijos del sistema, presentes para todos los clientes. No se
 * persisten en BBDD: se inyectan en la expansión del mes visible.
 *
 * - Mediciones: todos los lunes.
 * - Check-in: todos los domingos.
 */
export const FIXED_EVENTS = [
    { id: 'system-measurement', event_type: 'measurement', title: 'Mediciones', weekday: 1 },
    { id: 'system-check-in', event_type: 'check_in', title: 'Check-in', weekday: 7 },
];

/**
 * Rango de fechas (ISO) que cubre un mes visible más un margen de una semana,
 * usado para consultar el estado "hecho" de las ocurrencias de ese mes.
 *
 * El margen es necesario porque una tarea del mes (p. ej. un lunes 30) puede
 * completarse dentro de la semana siguiente, que ya cae fuera del mes.
 *
 * @param {number} year - Año.
 * @param {number} month0 - Mes 0-indexado.
 * @returns {{from: string, to: string}} Rango ISO ampliado.
 */
export const completionRange = (year, month0) => {
    const first = new Date(year, month0, 1);
    const last = new Date(year, month0, daysInMonth(year, month0));
    return {
        from: toISODate(addDays(first, -7)),
        to: toISODate(addDays(last, 7)),
    };
};

/**
 * Clampa un día del mes a la longitud real del mes (p. ej. 31 en febrero
 * devuelve el último día).
 *
 * @param {number} year - Año.
 * @param {number} month0 - Mes 0-indexado.
 * @param {number} day - Día del mes solicitado.
 * @returns {Date} Fecha con el día ajustado a la longitud del mes.
 */
const clampDay = (year, month0, day) =>
    new Date(year, month0, Math.min(day, daysInMonth(year, month0)));

/**
 * Alinea el cursor a la primera ocurrencia que respeta la regla RRULE a partir
 * de `dtstart` (semántica RFC 5545: DTSTART es la primera instancia).
 *
 * @param {Object} master - Evento maestro con los campos de la regla RRULE.
 * @param {Date} start - Fecha de anclaje (`dtstart`).
 * @returns {Date} Primera ocurrencia igual o posterior a `start`.
 */
const alignStart = (master, start) => {
    const freq = master.freq;
    const interval = master.recurrence_interval || 1;

    if (freq === 'weekly') {
        const byday = master.byday ?? toISOWeekday(start);
        let cursor = start;
        while (toISOWeekday(cursor) !== byday) cursor = addDays(cursor, 1);
        return cursor;
    }

    if (freq === 'monthly') {
        const day = master.bymonthday ?? start.getDate();
        let y = start.getFullYear();
        let m = start.getMonth();
        let candidate = clampDay(y, m, day);
        while (candidate < start) {
            m += interval;
            y += Math.floor(m / 12);
            m %= 12;
            candidate = clampDay(y, m, day);
        }
        return candidate;
    }

    if (freq === 'yearly') {
        const month = master.bymonth ?? start.getMonth() + 1;
        const day = master.bymonthday ?? start.getDate();
        let y = start.getFullYear();
        let candidate = clampDay(y, month - 1, day);
        while (candidate < start) {
            y += interval;
            candidate = clampDay(y, month - 1, day);
        }
        return candidate;
    }

    return start;
};

/**
 * Avanza el cursor a la siguiente ocurrencia según la regla RRULE.
 *
 * @param {Object} master - Evento maestro con los campos de la regla RRULE.
 * @param {Date} cursor - Ocurrencia actual.
 * @returns {Date} Siguiente ocurrencia.
 */
const stepOccurrence = (master, cursor) => {
    const freq = master.freq;
    const interval = master.recurrence_interval || 1;

    if (freq === 'weekly') {
        return addDays(cursor, 7 * interval);
    }

    if (freq === 'monthly') {
        const day = master.bymonthday ?? cursor.getDate();
        const total = cursor.getFullYear() * 12 + cursor.getMonth() + interval;
        const y = Math.floor(total / 12);
        const m = total % 12;
        return clampDay(y, m, day);
    }

    if (freq === 'yearly') {
        const month = master.bymonth ?? cursor.getMonth() + 1;
        const day = master.bymonthday ?? cursor.getDate();
        return clampDay(cursor.getFullYear() + interval, month - 1, day);
    }

    return cursor;
};

/**
 * Expande la regla de recurrencia de un maestro a las fechas (ISO) que caen
 * dentro de `[fromISO, toISO]`.
 *
 * Soporta `once` (`freq` nulo), `weekly`, `monthly` y `yearly`, respetando
 * `recurrence_interval`, `count` (número máximo de ocurrencias) y `until`
 * (fecha de fin, inclusive).
 *
 * @param {Object} master - Evento maestro con `dtstart` y la regla RRULE.
 * @param {string} fromISO - Inicio del rango (inclusive).
 * @param {string} toISO - Fin del rango (inclusive).
 * @returns {string[]} Fechas ISO de las ocurrencias dentro del rango.
 */
export const expandRRule = (master, fromISO, toISO) => {
    if (!master || !master.dtstart) return [];

    if (!master.freq) {
        return master.dtstart >= fromISO && master.dtstart <= toISO
            ? [master.dtstart]
            : [];
    }

    const count = master.count ?? null;
    const until = master.until ?? null;
    const results = [];
    let cursor = alignStart(master, fromISODate(master.dtstart));
    let index = 0;

    while (true) {
        if (count != null && index >= count) break;

        const iso = toISODate(cursor);
        if (until && iso > until) break;
        if (iso > toISO) break;
        if (iso >= fromISO) results.push(iso);

        index++;
        cursor = stepOccurrence(master, cursor);
    }

    return results;
};

/**
 * Aplica las excepciones (EXDATE / RECURRENCE-ID) a una lista de ocurrencias.
 *
 * - `cancelled`: elimina la ocurrencia.
 * - `modified`: sustituye título/descripción/hora y, si hay `new_date`,
 *   reubica la fecha.
 *
 * @param {Array<{date: string, event: Object}>} occurrences - Ocurrencias base.
 * @param {Array<Object>} exceptions - Filas de `calendar_event_exception`.
 * @returns {Array<{date: string, event: Object}>} Ocurrencias con las
 *   excepciones aplicadas.
 */
export const applyExceptions = (occurrences, exceptions) => {
    if (!exceptions || exceptions.length === 0) return occurrences;

    const byDate = new Map();
    exceptions.forEach((ex) => byDate.set(ex.recurrence_id, ex));

    const result = [];
    occurrences.forEach((occ) => {
        const ex = byDate.get(occ.date);
        if (!ex) {
            result.push(occ);
            return;
        }

        if (ex.status === 'cancelled') return;

        result.push({
            date: ex.new_date || occ.date,
            event: {
                ...occ.event,
                title: ex.title ?? occ.event.title,
                description: ex.description ?? occ.event.description,
                start_time: ex.new_start_time ?? occ.event.start_time,
            },
        });
    });

    return result;
};

/**
 * Genera la parrilla del mes (semanas de 7 celdas, empezando en lunes).
 * Las celdas vacías (fuera del mes) son `null`.
 *
 * @param {number} year - Año.
 * @param {number} month0 - Mes 0-indexado.
 * @returns {Array<Array<number|null>>} Semanas de 7 celdas con el día del mes.
 */
export const buildMonthGrid = (year, month0) => {
    const offset = toISOWeekday(new Date(year, month0, 1)) - 1;
    const total = daysInMonth(year, month0);

    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
};

/**
 * Expande los maestros (persistidos) + los eventos fijos del sistema a las
 * ocurrencias del mes visible, aplicando excepciones y ordenando por fecha.
 *
 * @param {Array<Object>} masters - Filas de `calendar_event`.
 * @param {Array<Object>} exceptions - Filas de `calendar_event_exception`.
 * @param {number} year - Año.
 * @param {number} month0 - Mes 0-indexado.
 * @returns {Array<{date: string, event: Object}>} Ocurrencias del mes.
 */
export const expandOccurrences = (masters, exceptions, year, month0) => {
    const from = `${year}-${pad(month0 + 1)}-01`;
    const to = `${year}-${pad(month0 + 1)}-${pad(daysInMonth(year, month0))}`;

    const occurrences = [];

    (masters || []).forEach((master) => {
        if (master.active === false) return;
        expandRRule(master, from, to).forEach((date) => {
            occurrences.push({ date, event: master });
        });
    });

    FIXED_EVENTS.forEach((fixed) => {
        for (let d = 1; d <= daysInMonth(year, month0); d++) {
            const date = new Date(year, month0, d);
            if (toISOWeekday(date) === fixed.weekday) {
                occurrences.push({ date: toISODate(date), event: fixed });
            }
        }
    });

    return applyExceptions(occurrences, exceptions)
        .filter((o) => o.date >= from && o.date <= to)
        .sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Agrupa las filas de mediciones, check-ins, fotos y sesiones en conjuntos que
 * permiten saber si una ocurrencia ya está "hecha".
 *
 * - Mediciones: lunes de la semana con medición.
 * - Check-ins: domingo de la semana con check-in.
 * - Fotos: mes (`YYYY-MM`) con foto corporal.
 * - Entrenos: por rutina, lunes de la semana con sesión completada.
 *
 * @param {Object} params - Fuentes de datos.
 * @param {Array} params.measurements - Filas de `measurement`.
 * @param {Array} params.checkIns - Filas de `check_in`.
 * @param {Array} params.photos - Filas de `body_photo`.
 * @param {Array} params.sessions - Filas de `training_session` completadas.
 * @returns {{measurementWeeks: Set<string>, checkInWeeks: Set<string>,
 *   photoMonths: Set<string>, trainingWeeksByRoutine: Map<number, Set<string>>}}
 */
export const buildCompletions = ({ measurements, checkIns, photos, sessions }) => {
    const measurementWeeks = new Set();
    (measurements || []).forEach((m) => {
        if (m.created_at) measurementWeeks.add(weekStartMonday(toISODate(new Date(m.created_at))));
    });

    const checkInWeeks = new Set();
    (checkIns || []).forEach((c) => {
        if (c.created_at) {
            const monday = weekStartMonday(toISODate(new Date(c.created_at)));
            checkInWeeks.add(toISODate(addDays(fromISODate(monday), 6)));
        }
    });

    const photoMonths = new Set();
    (photos || []).forEach((p) => {
        if (p.taken_at) photoMonths.add(p.taken_at.slice(0, 7));
    });

    const trainingWeeksByRoutine = new Map();
    (sessions || []).forEach((s) => {
        if (!s.routine_id) return;
        const monday = weekStartMonday(toISODate(new Date(s.started_at || s.created_at)));
        if (!trainingWeeksByRoutine.has(s.routine_id)) {
            trainingWeeksByRoutine.set(s.routine_id, new Set());
        }
        trainingWeeksByRoutine.get(s.routine_id).add(monday);
    });

    return { measurementWeeks, checkInWeeks, photoMonths, trainingWeeksByRoutine };
};

/**
 * Indica si una ocurrencia concreta ya está "hecha", según su tipo.
 *
 * @param {string} date - Fecha ISO de la ocurrencia.
 * @param {Object} event - Evento (maestro o fijo) de la ocurrencia.
 * @param {Object} completions - Resultado de {@link buildCompletions}.
 * @returns {boolean} `true` si la tarea ya está registrada.
 */
export const isEventCompleted = (date, event, completions) => {
    if (!completions) return false;

    switch (event.event_type) {
        case 'measurement':
            return completions.measurementWeeks?.has(date) ?? false;
        case 'check_in':
            return completions.checkInWeeks?.has(date) ?? false;
        case 'photos':
            return completions.photoMonths?.has(date.slice(0, 7)) ?? false;
        case 'training': {
            if (!event.routine_id) return false;
            const monday = weekStartMonday(date);
            return completions.trainingWeeksByRoutine?.get(event.routine_id)?.has(monday) ?? false;
        }
        default:
            return false;
    }
};

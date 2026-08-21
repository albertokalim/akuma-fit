import { describe, it, expect } from 'vitest';
import {
    toISODate,
    fromISODate,
    toISOWeekday,
    addDays,
    daysInMonth,
    weekStartMonday,
    completionRange,
    expandRRule,
    applyExceptions,
    buildMonthGrid,
    expandOccurrences,
    buildCompletions,
    isEventCompleted,
} from '../calendar.js';

describe('helpers de fecha', () => {
    it('convierte Date a ISO y viceversa', () => {
        expect(toISODate(new Date(2026, 7, 19))).toBe('2026-08-19');
        expect(fromISODate('2026-08-19').getDate()).toBe(19);
    });

    it('calcula el día de la semana ISO (lunes=1)', () => {
        expect(toISOWeekday(new Date(2026, 7, 17))).toBe(1); // lunes
        expect(toISOWeekday(new Date(2026, 7, 23))).toBe(7); // domingo
    });

    it('suma días', () => {
        expect(toISODate(addDays(new Date(2026, 7, 31), 1))).toBe('2026-09-01');
    });

    it('calcula días del mes', () => {
        expect(daysInMonth(2026, 1)).toBe(28);
        expect(daysInMonth(2024, 1)).toBe(29);
    });

    it('calcula el lunes de la semana', () => {
        expect(weekStartMonday('2026-08-19')).toBe('2026-08-17');
        expect(weekStartMonday('2026-08-17')).toBe('2026-08-17');
    });
});

describe('completionRange', () => {
    it('cubre el mes con margen de una semana', () => {
        const { from, to } = completionRange(2026, 7);
        expect(from).toBe('2026-07-25');
        expect(to).toBe('2026-09-07');
    });
});

describe('expandRRule', () => {
    it('expande un evento único dentro del rango', () => {
        const master = { dtstart: '2026-08-10' };
        expect(expandRRule(master, '2026-08-01', '2026-08-31')).toEqual(['2026-08-10']);
        expect(expandRRule(master, '2026-09-01', '2026-09-30')).toEqual([]);
    });

    it('expande semanal por día de la semana', () => {
        const master = { freq: 'weekly', byday: 1, dtstart: '2026-08-03', recurrence_interval: 1 };
        expect(expandRRule(master, '2026-08-01', '2026-08-31')).toEqual([
            '2026-08-03', '2026-08-10', '2026-08-17', '2026-08-24', '2026-08-31',
        ]);
    });

    it('respeta el intervalo semanal', () => {
        const master = { freq: 'weekly', byday: 1, dtstart: '2026-08-03', recurrence_interval: 2 };
        expect(expandRRule(master, '2026-08-01', '2026-08-31')).toEqual([
            '2026-08-03', '2026-08-17', '2026-08-31',
        ]);
    });

    it('expande mensual con clamp de día', () => {
        const master = { freq: 'monthly', bymonthday: 31, dtstart: '2026-01-31', recurrence_interval: 1 };
        expect(expandRRule(master, '2026-02-01', '2026-02-28')).toEqual(['2026-02-28']);
    });

    it('expande anual', () => {
        const master = { freq: 'yearly', bymonth: 8, bymonthday: 19, dtstart: '2026-08-19', recurrence_interval: 1 };
        expect(expandRRule(master, '2026-01-01', '2028-12-31')).toEqual([
            '2026-08-19', '2027-08-19', '2028-08-19',
        ]);
    });

    it('respeta until (inclusive)', () => {
        const master = { freq: 'weekly', byday: 1, dtstart: '2026-08-03', recurrence_interval: 1, until: '2026-08-17' };
        expect(expandRRule(master, '2026-08-01', '2026-08-31')).toEqual([
            '2026-08-03', '2026-08-10', '2026-08-17',
        ]);
    });

    it('respeta count', () => {
        const master = { freq: 'weekly', byday: 1, dtstart: '2026-08-03', recurrence_interval: 1, count: 2 };
        expect(expandRRule(master, '2026-08-01', '2026-09-30')).toEqual([
            '2026-08-03', '2026-08-10',
        ]);
    });
});

describe('applyExceptions', () => {
    const occurrences = [
        { date: '2026-08-10', event: { id: 1, title: 'A' } },
        { date: '2026-08-17', event: { id: 1, title: 'A' } },
    ];

    it('elimina una ocurrencia cancelada', () => {
        const result = applyExceptions(occurrences, [
            { event_id: 1, recurrence_id: '2026-08-10', status: 'cancelled' },
        ]);
        expect(result.map((o) => o.date)).toEqual(['2026-08-17']);
    });

    it('modifica una ocurrencia', () => {
        const result = applyExceptions(occurrences, [
            { event_id: 1, recurrence_id: '2026-08-17', status: 'modified', title: 'B' },
        ]);
        expect(result[1]).toEqual({ date: '2026-08-17', event: { id: 1, title: 'B' } });
    });

    it('reubica una ocurrencia movida', () => {
        const result = applyExceptions(occurrences, [
            { event_id: 1, recurrence_id: '2026-08-17', status: 'modified', new_date: '2026-08-18', title: 'B' },
        ]);
        expect(result[1].date).toBe('2026-08-18');
    });
});

describe('buildMonthGrid', () => {
    it('genera semanas completas empezando en lunes', () => {
        const weeks = buildMonthGrid(2026, 7); // agosto 2026
        expect(weeks[0][0]).toBe(null); // sábado 1 (offset 5)
        expect(weeks[0][5]).toBe(1);
        weeks.forEach((week) => expect(week).toHaveLength(7));
    });
});

describe('expandOccurrences', () => {
    it('incluye los eventos fijos (lunes y domingo) y los maestros', () => {
        const masters = [{ id: 10, event_type: 'training', freq: 'weekly', byday: 3, dtstart: '2026-08-05', recurrence_interval: 1 }];
        const occurrences = expandOccurrences(masters, [], 2026, 7);

        const types = occurrences.map((o) => o.event.event_type);
        expect(types).toContain('measurement');
        expect(types).toContain('check_in');
        expect(types).toContain('training');
    });

    it('aplica excepciones y no devuelve fechas fuera del mes', () => {
        const masters = [{ id: 10, event_type: 'training', freq: 'weekly', byday: 1, dtstart: '2026-08-03', recurrence_interval: 1 }];
        const occurrences = expandOccurrences(
            masters,
            [{ event_id: 10, recurrence_id: '2026-08-03', status: 'cancelled' }],
            2026,
            7
        );
        expect(occurrences.every((o) => o.date.startsWith('2026-08'))).toBe(true);
        expect(occurrences.some((o) => o.date === '2026-08-03')).toBe(false);
    });
});

describe('buildCompletions / isEventCompleted', () => {
    const completions = buildCompletions({
        measurements: [{ created_at: '2026-08-17T10:00:00Z' }],
        checkIns: [{ created_at: '2026-08-23T10:00:00Z' }],
        photos: [{ taken_at: '2026-08-05' }],
        sessions: [{ routine_id: 5, started_at: '2026-08-17T10:00:00Z' }],
    });

    it('marca mediciones por semana', () => {
        expect(isEventCompleted('2026-08-17', { event_type: 'measurement' }, completions)).toBe(true);
        expect(isEventCompleted('2026-08-24', { event_type: 'measurement' }, completions)).toBe(false);
    });

    it('marca check-in por semana (domingo)', () => {
        expect(isEventCompleted('2026-08-23', { event_type: 'check_in' }, completions)).toBe(true);
        expect(isEventCompleted('2026-08-30', { event_type: 'check_in' }, completions)).toBe(false);
    });

    it('marca fotos por mes', () => {
        expect(isEventCompleted('2026-08-15', { event_type: 'photos' }, completions)).toBe(true);
        expect(isEventCompleted('2026-09-15', { event_type: 'photos' }, completions)).toBe(false);
    });

    it('marca entrenos por semana y rutina', () => {
        expect(isEventCompleted('2026-08-19', { event_type: 'training', routine_id: 5 }, completions)).toBe(true);
        expect(isEventCompleted('2026-08-19', { event_type: 'training', routine_id: 6 }, completions)).toBe(false);
    });

    it('no marca eventos informativos', () => {
        expect(isEventCompleted('2026-08-17', { event_type: 'info' }, completions)).toBe(false);
    });
});

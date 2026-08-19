import { describe, it, expect } from 'vitest';
import { normalizeNumericFields, formatDate, filterByDateRange } from '../data.js';

describe('normalizeNumericFields', () => {
    it('convierte strings numéricos a números', () => {
        const result = normalizeNumericFields({ weight: '72.5', reps: '10' }, ['weight', 'reps']);
        expect(result).toEqual({ weight: 72.5, reps: 10 });
    });

    it('convierte valores vacíos a null', () => {
        const result = normalizeNumericFields({ weight: '', reps: '10' }, ['weight', 'reps']);
        expect(result).toEqual({ weight: null, reps: 10 });
    });

    it('no muta el objeto original', () => {
        const original = { weight: '72.5' };
        normalizeNumericFields(original, ['weight']);
        expect(original.weight).toBe('72.5');
    });

    it('mantiene intactos los campos no numéricos', () => {
        const result = normalizeNumericFields({ notes: 'hola', weight: '70' }, ['weight']);
        expect(result.notes).toBe('hola');
    });
});

describe('formatDate', () => {
    it('formatea con el formato por defecto dd/mm/yyyy', () => {
        expect(formatDate('2026-08-09T12:00:00')).toBe('09/08/2026');
    });

    it('acepta opciones de formato personalizadas', () => {
        const result = formatDate('2026-08-09T12:00:00', { month: 'long', year: 'numeric' });
        expect(result).toContain('agosto');
        expect(result).toContain('2026');
    });
});

describe('filterByDateRange', () => {
    const measurements = [
        { id: 1, created_at: '2026-07-15T10:00:00Z' },
        { id: 2, created_at: '2026-08-01T10:00:00Z' },
        { id: 3, created_at: '2026-08-09T10:00:00Z' },
    ];

    it('filtra mediciones anteriores a la fecha de inicio', () => {
        const result = filterByDateRange(measurements, '2026-08-01', null);
        expect(result.map(m => m.id)).toEqual([2, 3]);
    });

    it('filtra mediciones posteriores a la fecha de fin', () => {
        const result = filterByDateRange(measurements, null, '2026-08-01');
        expect(result.map(m => m.id)).toEqual([1, 2]);
    });

    it('incluye mediciones del día de fin hasta las 23:59', () => {
        const late = [{ id: 9, created_at: '2026-08-01T20:00:00' }];
        const result = filterByDateRange(late, null, '2026-08-01');
        expect(result).toHaveLength(1);
    });

    it('devuelve todo si no hay fechas', () => {
        expect(filterByDateRange(measurements, null, null)).toHaveLength(3);
    });
});

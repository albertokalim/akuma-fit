import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabaseMock } from '../../test/mocks/supabase.js';
import { eventService } from '../eventService.js';

vi.mock('../../supabaseClient.js', async () => {
    const { supabaseMock } = await import('../../test/mocks/supabase.js');
    return { supabase: supabaseMock };
});

const lastQueryBuilder = () => supabaseMock.from.mock.results.at(-1).value;

describe('eventService', () => {
    beforeEach(() => {
        supabaseMock.reset();
    });

    describe('getByClient', () => {
        it('devuelve eventos y sus excepciones', async () => {
            supabaseMock.setResultForTable('calendar_event', {
                data: [{ id: 1, title: 'Entreno' }],
                error: null,
            });
            supabaseMock.setResultForTable('calendar_event_exception', {
                data: [{ id: 9, event_id: 1, status: 'cancelled' }],
                error: null,
            });

            const result = await eventService.getByClient(42);

            expect(result.events).toEqual([{ id: 1, title: 'Entreno' }]);
            expect(result.exceptions).toEqual([{ id: 9, event_id: 1, status: 'cancelled' }]);
            expect(supabaseMock.from).toHaveBeenCalledWith('calendar_event');
        });

        it('lanza el error de Supabase', async () => {
            supabaseMock.setResultForTable('calendar_event', {
                data: null,
                error: { message: 'permission denied' },
            });

            await expect(eventService.getByClient(42)).rejects.toThrow('permission denied');
        });
    });

    describe('getCompletions', () => {
        it('consulta las cuatro fuentes y agrupa el estado hecho', async () => {
            supabaseMock.setResultForTable('measurement', {
                data: [{ created_at: '2026-08-17T10:00:00Z' }],
                error: null,
            });
            supabaseMock.setResultForTable('check_in', { data: [], error: null });
            supabaseMock.setResultForTable('body_photo', { data: [], error: null });
            supabaseMock.setResultForTable('training_session', { data: [], error: null });

            const completions = await eventService.getCompletions(42, {
                from: '2026-08-01',
                to: '2026-08-31',
            });

            expect(completions.measurementWeeks.has('2026-08-17')).toBe(true);
            expect(supabaseMock.from).toHaveBeenCalledWith('measurement');
        });
    });

    describe('create', () => {
        it('inserta un maestro con los campos mapeados', async () => {
            const created = { id: 7 };
            supabaseMock.setResultForTable('calendar_event', { data: created, error: null });

            await expect(
                eventService.create({
                    profileId: 42,
                    createdBy: 1,
                    eventType: 'training',
                    title: 'Pecho',
                    freq: 'weekly',
                    byday: 1,
                    dtstart: '2026-08-03',
                    interval: '2',
                    routineId: 5,
                })
            ).resolves.toEqual(created);

            const insertCall = lastQueryBuilder().calls.find((c) => c.method === 'insert');
            expect(insertCall.args[0]).toMatchObject({
                profile_id: 42,
                event_type: 'training',
                title: 'Pecho',
                freq: 'weekly',
                byday: 1,
                recurrence_interval: 2,
                routine_id: 5,
            });
        });
    });

    describe('update', () => {
        it('mapea solo los campos indicados', async () => {
            supabaseMock.setResultForTable('calendar_event', { data: [], error: null });

            await eventService.update(7, { title: 'Nuevo', startTime: '09:00' });

            const updateCall = lastQueryBuilder().calls.find((c) => c.method === 'update');
            expect(updateCall.args[0]).toEqual({ title: 'Nuevo', start_time: '09:00' });
            expect(lastQueryBuilder().calls).toContainEqual({ method: 'eq', args: ['id', 7] });
        });
    });

    describe('remove', () => {
        it('desactiva el maestro (soft delete)', async () => {
            supabaseMock.setResultForTable('calendar_event', { data: [], error: null });

            await eventService.remove(7);

            const updateCall = lastQueryBuilder().calls.find((c) => c.method === 'update');
            expect(updateCall.args[0]).toEqual({ active: false });
        });
    });

    describe('cancelOccurrence', () => {
        it('hace upsert de una excepción cancelled', async () => {
            supabaseMock.setResultForTable('calendar_event_exception', { data: [], error: null });

            await eventService.cancelOccurrence(7, '2026-08-10');

            const upsertCall = lastQueryBuilder().calls.find((c) => c.method === 'upsert');
            expect(upsertCall.args[0]).toMatchObject({
                event_id: 7,
                recurrence_id: '2026-08-10',
                status: 'cancelled',
            });
        });
    });

    describe('modifyOccurrence', () => {
        it('hace upsert de una excepción modified', async () => {
            supabaseMock.setResultForTable('calendar_event_exception', { data: [], error: null });

            await eventService.modifyOccurrence(7, '2026-08-10', { title: 'B', startTime: '10:00' });

            const upsertCall = lastQueryBuilder().calls.find((c) => c.method === 'upsert');
            expect(upsertCall.args[0]).toMatchObject({
                event_id: 7,
                recurrence_id: '2026-08-10',
                status: 'modified',
                title: 'B',
                new_start_time: '10:00',
            });
        });
    });

    describe('splitSeries', () => {
        it('llama a la función Postgres con los parámetros resueltos', async () => {
            supabaseMock.setRpcResult('split_calendar_event', { data: 99, error: null });

            const original = {
                id: 7,
                title: 'Original',
                description: null,
                start_time: '09:00',
                freq: 'weekly',
                recurrence_interval: 1,
                byday: 1,
                routine_id: 5,
            };

            await expect(
                eventService.splitSeries(original, '2026-08-24', { title: 'Nuevo' })
            ).resolves.toEqual(99);

            expect(supabaseMock.rpc).toHaveBeenCalledWith(
                'split_calendar_event',
                expect.objectContaining({
                    p_event_id: 7,
                    p_from_date: '2026-08-24',
                    p_title: 'Nuevo',
                    p_freq: 'weekly',
                    p_byday: 1,
                    p_routine_id: 5,
                })
            );
        });
    });
});

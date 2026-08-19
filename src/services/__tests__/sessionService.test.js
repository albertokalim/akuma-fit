import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabaseMock } from '../../test/mocks/supabase.js';
import { sessionService } from '../sessionService.js';

vi.mock('../../supabaseClient.js', async () => {
    const { supabaseMock } = await import('../../test/mocks/supabase.js');
    return { supabase: supabaseMock };
});

const lastQueryBuilder = () =>
    supabaseMock.from.mock.results.at(-1).value;

describe('sessionService', () => {
    beforeEach(() => {
        supabaseMock.reset();
    });

    describe('getActive', () => {
        it('devuelve la sesión activa', async () => {
            const session = { id: 1, routine_id: 5 };
            supabaseMock.setResultForTable('training_session', { data: session, error: null });

            await expect(sessionService.getActive(42)).resolves.toEqual(session);

            expect(supabaseMock.from).toHaveBeenCalledWith('training_session');
            expect(lastQueryBuilder().calls).toEqual(
                expect.arrayContaining([
                    { method: 'eq', args: ['profile_id', 42] },
                    { method: 'eq', args: ['status', 'active'] },
                ])
            );
        });

        it('devuelve null si no hay sesión', async () => {
            supabaseMock.setResultForTable('training_session', { data: null, error: null });
            await expect(sessionService.getActive(42)).resolves.toBeNull();
        });

        it('lanza el error de Supabase', async () => {
            supabaseMock.setResultForTable('training_session', {
                data: null,
                error: { message: 'permission denied' },
            });
            await expect(sessionService.getActive(42)).rejects.toThrow('permission denied');
        });
    });

    describe('create', () => {
        it('llama a la función Postgres con los parámetros correctos', async () => {
            const session = { id: 9, routine_id: 5, started_at: '2026-08-09T10:00:00Z' };
            supabaseMock.setRpcResult('create_training_session', { data: session, error: null });

            await expect(sessionService.create(42, { id: 5 }))
                .resolves.toEqual(session);

            expect(supabaseMock.rpc).toHaveBeenCalledWith(
                'create_training_session',
                { p_profile_id: 42, p_routine_id: 5 }
            );
        });

        it('lanza el error de Supabase', async () => {
            supabaseMock.setRpcResult('create_training_session', {
                data: null,
                error: { message: 'routine not found' },
            });
            await expect(sessionService.create(42, { id: 5 }))
                .rejects.toThrow('routine not found');
        });
    });

    describe('saveSet', () => {
        it('hace upsert del set mapeando reps/kg/type', async () => {
            supabaseMock.setResultForTable('completed_set', { data: [], error: null });

            await sessionService.saveSet(7, 2, { reps: 10, kg: 60, type: 'warmup' });

            expect(supabaseMock.from).toHaveBeenCalledWith('completed_set');
            expect(lastQueryBuilder().calls).toContainEqual({
                method: 'upsert',
                args: [
                    {
                        completed_exercise_id: 7,
                        set_order: 2,
                        reps_completed: 10,
                        kg_used: 60,
                        type: 'warmup',
                    },
                    { onConflict: 'completed_exercise_id,set_order' },
                ],
            });
        });
    });

    describe('finish', () => {
        it('marca la sesión como completada', async () => {
            supabaseMock.setResultForTable('training_session', { data: [], error: null });

            await sessionService.finish(9, { feeling: 'great', notes: 'ok' });

            const updateCall = lastQueryBuilder().calls.find(c => c.method === 'update');
            expect(updateCall.args[0]).toMatchObject({
                status: 'completed',
                completed: true,
                feeling: 'great',
                notes: 'ok',
            });
            expect(lastQueryBuilder().calls).toContainEqual({ method: 'eq', args: ['id', 9] });
        });
    });
});

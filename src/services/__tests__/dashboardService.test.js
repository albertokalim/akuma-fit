import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabaseMock } from '../../test/mocks/supabase.js';
import { dashboardService } from '../dashboardService.js';

vi.mock('../../supabaseClient.js', async () => {
    const { supabaseMock } = await import('../../test/mocks/supabase.js');
    return { supabase: supabaseMock };
});

const lastRpcCall = () => supabaseMock.rpc.mock.calls.at(-1);

describe('dashboardService.getAlerts', () => {
    beforeEach(() => {
        supabaseMock.reset();
    });

    it('devuelve [] sin llamar al RPC si no hay clientes', async () => {
        supabaseMock.setResultForTable('profile', { data: [], error: null });

        await expect(dashboardService.getAlerts()).resolves.toEqual([]);
        expect(supabaseMock.rpc).not.toHaveBeenCalled();
    });

    it('llama al RPC una única vez con los IDs de todos los clientes', async () => {
        const clients = [
            { id: 1, name: 'Ana', surname: 'García' },
            { id: 2, name: 'Luis', surname: 'Pérez' },
        ];
        supabaseMock.setResultForTable('profile', { data: clients, error: null });
        supabaseMock.setRpcResult('get_recent_checkins_per_profile', { data: [], error: null });

        await dashboardService.getAlerts();

        expect(supabaseMock.rpc).toHaveBeenCalledTimes(1);
        const [fnName, params] = lastRpcCall();
        expect(fnName).toBe('get_recent_checkins_per_profile');
        expect(params).toEqual({
            p_profile_ids: [1, 2],
            p_limit_per_profile: 3,
        });
    });

    it('agrupa los check-ins por profile_id y detecta baja adherencia a la dieta', async () => {
        const clients = [{ id: 1, name: 'Ana', surname: 'García' }];
        supabaseMock.setResultForTable('profile', { data: clients, error: null });

        const checkIns = [
            { profile_id: 1, created_at: '2024-01-15', diet_adherence: 'Nada', training_adherence: 'Totalmente', energy_level: 8, rest_quality: 8 },
            { profile_id: 1, created_at: '2024-01-08', diet_adherence: 'Nada', training_adherence: 'Totalmente', energy_level: 8, rest_quality: 8 },
            { profile_id: 1, created_at: '2024-01-01', diet_adherence: 'Nada', training_adherence: 'Totalmente', energy_level: 8, rest_quality: 8 },
        ];
        supabaseMock.setRpcResult('get_recent_checkins_per_profile', { data: checkIns, error: null });

        const alerts = await dashboardService.getAlerts();

        expect(alerts).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ clientName: 'Ana García', text: 'Baja adherencia a la dieta' }),
            ])
        );
    });

    it('ignora clientes sin check-ins recientes', async () => {
        const clients = [
            { id: 1, name: 'Ana', surname: 'García' },
            { id: 2, name: 'Sin', surname: 'CheckIns' },
        ];
        supabaseMock.setResultForTable('profile', { data: clients, error: null });
        supabaseMock.setRpcResult('get_recent_checkins_per_profile', {
            data: [
                { profile_id: 1, created_at: '2024-01-15', diet_adherence: 'Nada', training_adherence: 'Nada', energy_level: 1, rest_quality: 1 },
            ],
            error: null,
        });

        const alerts = await dashboardService.getAlerts();

        expect(alerts.every(a => a.clientName !== 'Sin CheckIns')).toBe(true);
    });

    it('lanza el error de Supabase si falla la query de profile', async () => {
        supabaseMock.setResultForTable('profile', { data: null, error: { message: 'boom' } });
        await expect(dashboardService.getAlerts()).rejects.toThrow('boom');
    });

    it('lanza el error de Supabase si falla el RPC', async () => {
        supabaseMock.setResultForTable('profile', { data: [{ id: 1, name: 'Ana', surname: 'García' }], error: null });
        supabaseMock.setRpcResult('get_recent_checkins_per_profile', { data: null, error: { message: 'rpc failed' } });

        await expect(dashboardService.getAlerts()).rejects.toThrow('rpc failed');
    });
});

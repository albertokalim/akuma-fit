import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResource } from '../useResource.js';

describe('useResource', () => {
    it('carga los datos del servicio', async () => {
        const service = { getAll: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]) };
        const { result } = renderHook(() => useResource(service));

        let data;
        await act(async () => {
            data = await result.current.load();
        });

        expect(data).toEqual([{ id: 1 }, { id: 2 }]);
        expect(result.current.items).toEqual([{ id: 1 }, { id: 2 }]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('guarda el mensaje de error si el servicio falla', async () => {
        const service = { getAll: vi.fn().mockRejectedValue(new Error('network error')) };
        const { result } = renderHook(() => useResource(service));

        let data;
        await act(async () => {
            data = await result.current.load();
        });

        expect(data).toEqual([]);
        expect(result.current.items).toEqual([]);
        expect(result.current.error).toBe('network error');
        expect(result.current.loading).toBe(false);
    });

    it('expone loading mientras la carga está en curso', async () => {
        let resolveGetAll;
        const pending = new Promise(resolve => { resolveGetAll = resolve; });
        const service = { getAll: vi.fn().mockReturnValue(pending) };
        const { result } = renderHook(() => useResource(service));

        let loadPromise;
        act(() => {
            loadPromise = result.current.load();
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
            resolveGetAll([]);
            await loadPromise;
        });

        expect(result.current.loading).toBe(false);
    });

    it('reload es un alias de load', () => {
        const service = { getAll: vi.fn() };
        const { result } = renderHook(() => useResource(service));
        expect(result.current.reload).toBe(result.current.load);
    });
});

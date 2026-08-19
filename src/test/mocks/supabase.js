import { vi } from 'vitest';

const CHAIN_METHODS = [
    'select', 'insert', 'update', 'upsert', 'delete',
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'contains',
    'order', 'limit', 'range', 'match', 'is', 'not', 'or',
];

const createQueryBuilder = (getResult) => {
    const calls = [];

    const builder = {
        calls,
        then: (onFulfilled, onRejected) =>
            Promise.resolve(getResult()).then(onFulfilled, onRejected),
        catch: (onRejected) => Promise.resolve(getResult()).catch(onRejected),
        single: () => Promise.resolve(getResult()),
        maybeSingle: () => Promise.resolve(getResult()),
    };

    CHAIN_METHODS.forEach(method => {
        builder[method] = (...args) => {
            calls.push({ method, args });
            return builder;
        };
    });

    return builder;
};

const createStorageBucketMock = () => ({
    upload: vi.fn(() => Promise.resolve({ data: { path: 'mock/path' }, error: null })),
    remove: vi.fn(() => Promise.resolve({ data: [], error: null })),
    createSignedUrl: vi.fn(() => Promise.resolve({ data: { signedUrl: 'https://mock.url' }, error: null })),
    createSignedUrls: vi.fn(() => Promise.resolve({ data: [], error: null })),
    getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://mock.url' } })),
});

const createSupabaseMock = () => {
    const state = {
        result: { data: null, error: null },
        tableResults: {},
        rpcResults: {},
    };

    const mock = {
        from: vi.fn(table =>
            createQueryBuilder(() => state.tableResults[table] ?? state.result)),
        rpc: vi.fn(fn =>
            createQueryBuilder(() => state.rpcResults[fn] ?? state.result)),
        auth: {
            getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
            getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
            signInWithPassword: vi.fn(() => Promise.resolve({ data: {}, error: null })),
            signUp: vi.fn(() => Promise.resolve({ data: {}, error: null })),
            signOut: vi.fn(() => Promise.resolve({ error: null })),
            onAuthStateChange: vi.fn(() => ({
                data: { subscription: { unsubscribe: vi.fn() } },
            })),
            setSession: vi.fn(() => Promise.resolve({ data: {}, error: null })),
            resetPasswordForEmail: vi.fn(() => Promise.resolve({ data: {}, error: null })),
            updateUser: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        },
        storage: {
            from: vi.fn(() => createStorageBucketMock()),
        },

        setResult(result) {
            state.result = result;
            return mock;
        },
        setResultForTable(table, result) {
            state.tableResults[table] = result;
            return mock;
        },
        setRpcResult(fn, result) {
            state.rpcResults[fn] = result;
            return mock;
        },
        reset() {
            state.result = { data: null, error: null };
            state.tableResults = {};
            state.rpcResults = {};
            mock.from.mockClear();
            mock.rpc.mockClear();
            mock.storage.from.mockClear();
            Object.values(mock.auth).forEach(fn => fn.mockClear());
            return mock;
        },
    };

    return mock;
};

export const supabaseMock = createSupabaseMock();

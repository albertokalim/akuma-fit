import { supabase } from '../supabaseClient.js';

/**
 * Servicio de acceso a datos del dashboard del coach.
 */
export const dashboardService = {
    /**
     * Obtiene las estadísticas del dashboard: número de clientes activos y de
     * check-ins de la última semana.
     *
     * @returns {Promise<{activeClients: number, weeklyCheckIns: number}>} Estadísticas.
     */
    async getStats() {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const [{ count: activeClients, error: clientsError }, { count: weeklyCheckIns, error: checkInsError }] = await Promise.all([
            supabase
                .from('profile')
                .select('id', { count: 'exact', head: true })
                .eq('role', 'client'),
            supabase
                .from('check_in')
                .select('id', { count: 'exact', head: true })
                .gte('created_at', oneWeekAgo.toISOString()),
        ]);

        if (clientsError) throw new Error(clientsError.message);
        if (checkInsError) throw new Error(checkInsError.message);

        return {
            activeClients: activeClients || 0,
            weeklyCheckIns: weeklyCheckIns || 0,
        };
    },

    /**
     * Obtiene los check-ins más recientes con el nombre del cliente.
     *
     * @param {number} [limit=5] - Número máximo de check-ins.
     * @returns {Promise<Array<{text: string, time: string}>>} Check-ins recientes.
     */
    async getRecentCheckIns(limit = 5) {
        const { data, error } = await supabase
            .from('check_in')
            .select(`
                id,
                created_at,
                profile:profile_id (
                    name,
                    surname
                )
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw new Error(error.message);

        return data.map(checkIn => ({
            text: `${checkIn.profile.name} ${checkIn.profile.surname}`,
            time: new Date(checkIn.created_at).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit'
            })
        }));
    }
};

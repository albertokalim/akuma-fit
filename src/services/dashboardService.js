import { supabase } from '../supabaseClient.js';

export const dashboardService = {
    async getStats() {
        const { data: clients, error: clientsError } = await supabase
            .from('profile')
            .select('id')
            .eq('role', 'client');

        if (clientsError) throw new Error(clientsError.message);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data: recentCheckIns, error: checkInsError } = await supabase
            .from('check_in')
            .select('id')
            .gte('created_at', oneWeekAgo.toISOString());

        if (checkInsError) throw new Error(checkInsError.message);

        return {
            activeClients: clients.length,
            weeklyCheckIns: recentCheckIns.length
        };
    },

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

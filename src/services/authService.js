import { supabase } from '../supabaseClient.js';

export const authService = {
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },

    async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data;
    },

    async signOut() {
        await supabase.auth.signOut();
    },

    async getUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },

    async updateUser(attributes) {
        const { data, error } = await supabase.auth.updateUser(attributes);
        if (error) throw error;
        return data;
    },
};

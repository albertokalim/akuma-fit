import { supabase } from '../supabaseClient.js';
import { getCurrentProfile } from '../utils/auth.js';

const FOOD_SELECT = '*, food_has_tag(tag(id, name, category))';

const NUMERIC_FIELDS = ['calories', 'protein', 'carbs', 'fat', 'fiber'];

function mapFood(food) {
    const tags = (food.food_has_tag || []).map(rel => rel.tag).filter(Boolean);
    const rest = { ...food };
    delete rest.food_has_tag;
    return { ...rest, tags };
}

function buildPayload(foodData, createdBy) {
    return {
        name: foodData.name,
        brand: foodData.brand || null,
        calories: foodData.calories ?? null,
        protein: foodData.protein ?? null,
        carbs: foodData.carbs ?? null,
        fat: foodData.fat ?? null,
        fiber: foodData.fiber ?? null,
        serving_size: foodData.serving_size || null,
        ...(createdBy ? { created_by: createdBy } : {}),
    };
}

async function syncFoodTags(foodId, tagIds) {
    const { error: deleteError } = await supabase
        .from('food_has_tag')
        .delete()
        .eq('food_id', foodId);

    if (deleteError) throw new Error(deleteError.message);

    if (tagIds.length > 0) {
        const { error: insertError } = await supabase
            .from('food_has_tag')
            .insert(tagIds.map(tagId => ({ food_id: foodId, tag_id: tagId })));

        if (insertError) throw new Error(insertError.message);
    }
}

export const foodService = {
    async getAll(filters = {}) {
        let query = supabase
            .from('food')
            .select(FOOD_SELECT)
            .order('name');

        if (filters.text) {
            query = query.or(`name.ilike.%${filters.text}%,brand.ilike.%${filters.text}%`);
        }

        if (filters.tagIds && filters.tagIds.length > 0) {
            query = query.in('food_has_tag.tag', filters.tagIds);
        }

        const { data, error } = await query;

        if (error) throw new Error(error.message);
        return (data || []).map(mapFood);
    },

    async getById(foodId) {
        const { data, error } = await supabase
            .from('food')
            .select(FOOD_SELECT)
            .eq('id', foodId)
            .single();

        if (error) throw new Error(error.message);
        return mapFood(data);
    },

    async create(foodData, tagIds = []) {
        const profile = await getCurrentProfile();

        const { data: food, error } = await supabase
            .from('food')
            .insert(buildPayload(foodData, profile.id))
            .select()
            .single();

        if (error) throw new Error(error.message);

        if (tagIds.length > 0) {
            await syncFoodTags(food.id, tagIds);
        }

        return food;
    },

    async createBulk(items) {
        const profile = await getCurrentProfile();

        const rows = items.map(item => buildPayload(item, profile.id));

        const { error } = await supabase.from('food').insert(rows);
        if (error) throw new Error(error.message);
    },

    async update(foodId, foodData, tagIds) {
        const { data, error } = await supabase
            .from('food')
            .update(buildPayload(foodData))
            .eq('id', foodId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        if (tagIds !== undefined) {
            await syncFoodTags(foodId, tagIds);
        }

        return data;
    },

    async delete(foodId) {
        const { error } = await supabase
            .from('food')
            .delete()
            .eq('id', foodId);

        if (error) throw new Error(error.message);
    },
};

export { NUMERIC_FIELDS as FOOD_NUMERIC_FIELDS };

import { supabase } from '../supabaseClient.js';
import { getCurrentProfile } from '../utils/auth.js';

const RECIPE_SELECT = `
    *,
    recipe_food(
        food(*)
    ),
    recipe_has_tag(
        tag(id, name, category)
    )
`;

function mapRecipe(recipe) {
    const ingredients = (recipe.recipe_food || [])
        .filter(rel => rel.food)
        .map(rel => ({
            id: rel.id,
            food: rel.food,
            quantity_g: rel.quantity_g,
            notes: rel.notes,
        }));

    const tags = (recipe.recipe_has_tag || []).map(rel => rel.tag).filter(Boolean);

    const rest = { ...recipe };
    delete rest.recipe_food;
    delete rest.recipe_has_tag;
    return { ...rest, ingredients, tags };
}

async function syncRecipeTags(recipeId, tagIds) {
    const { error: deleteError } = await supabase
        .from('recipe_has_tag')
        .delete()
        .eq('recipe_id', recipeId);

    if (deleteError) throw new Error(deleteError.message);

    if (tagIds.length > 0) {
        const { error: insertError } = await supabase
            .from('recipe_has_tag')
            .insert(tagIds.map(tagId => ({ recipe_id: recipeId, tag_id: tagId })));

        if (insertError) throw new Error(insertError.message);
    }
}

async function setIngredients(recipeId, ingredients) {
    const { error: deleteError } = await supabase
        .from('recipe_food')
        .delete()
        .eq('recipe_id', recipeId);

    if (deleteError) throw new Error(deleteError.message);

    if (ingredients.length > 0) {
        const { error: insertError } = await supabase
            .from('recipe_food')
            .insert(ingredients.map(ingredient => ({
                recipe_id: recipeId,
                food_id: ingredient.food_id,
                quantity_g: ingredient.quantity_g,
                notes: ingredient.notes || null,
            })));

        if (insertError) throw new Error(insertError.message);
    }
}

export const recipeService = {
    async getAll(filters = {}) {
        let query = supabase
            .from('recipe')
            .select(RECIPE_SELECT)
            .order('name');

        if (filters.text) {
            query = query.ilike('name', `%${filters.text}%`);
        }

        if (filters.tagIds && filters.tagIds.length > 0) {
            query = query.in('recipe_has_tag.tag', filters.tagIds);
        }

        const { data, error } = await query;

        if (error) throw new Error(error.message);
        return (data || []).map(mapRecipe);
    },

    async getById(recipeId) {
        const { data, error } = await supabase
            .from('recipe')
            .select(RECIPE_SELECT)
            .eq('id', recipeId)
            .single();

        if (error) throw new Error(error.message);
        return mapRecipe(data);
    },

    async create(recipeData) {
        const profile = await getCurrentProfile();

        const { data: recipe, error } = await supabase
            .from('recipe')
            .insert({
                name: recipeData.name,
                description: recipeData.description || null,
                instructions: recipeData.instructions || null,
                preparation_time: recipeData.preparation_time ?? null,
                servings: recipeData.servings || 1,
                created_by: profile.id,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        await setIngredients(recipe.id, recipeData.ingredients || []);

        if ((recipeData.tagIds || []).length > 0) {
            await syncRecipeTags(recipe.id, recipeData.tagIds);
        }

        return recipe;
    },

    async update(recipeId, recipeData) {
        const { data, error } = await supabase
            .from('recipe')
            .update({
                name: recipeData.name,
                description: recipeData.description || null,
                instructions: recipeData.instructions || null,
                preparation_time: recipeData.preparation_time ?? null,
                servings: recipeData.servings || 1,
            })
            .eq('id', recipeId)
            .select()
            .single();

        if (error) throw new Error(error.message);

        if (recipeData.ingredients !== undefined) {
            await setIngredients(recipeId, recipeData.ingredients);
        }

        if (recipeData.tagIds !== undefined) {
            await syncRecipeTags(recipeId, recipeData.tagIds);
        }

        return data;
    },

    async delete(recipeId) {
        const { error } = await supabase
            .from('recipe')
            .delete()
            .eq('id', recipeId);

        if (error) throw new Error(error.message);
    },
};

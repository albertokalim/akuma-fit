const EMPTY_MACROS = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

export function emptyMacros() {
    return { ...EMPTY_MACROS };
}

export function sumMacros(macrosList) {
    return macrosList.reduce((acc, macros) => ({
        calories: acc.calories + (macros?.calories || 0),
        protein: acc.protein + (macros?.protein || 0),
        carbs: acc.carbs + (macros?.carbs || 0),
        fat: acc.fat + (macros?.fat || 0),
        fiber: acc.fiber + (macros?.fiber || 0),
    }), { ...EMPTY_MACROS });
}

function scaleMacros(macros, factor) {
    return {
        calories: macros.calories * factor,
        protein: macros.protein * factor,
        carbs: macros.carbs * factor,
        fat: macros.fat * factor,
        fiber: macros.fiber * factor,
    };
}

/**
 * Macros de un alimento para una cantidad en gramos. Los valores del
 * alimento están definidos por 100 g, así que se escalan proporcionalmente.
 */
export function foodMacros(food, quantityG) {
    if (!food || !quantityG) return { ...EMPTY_MACROS };
    return scaleMacros({
        calories: food.calories || 0,
        protein: food.protein || 0,
        carbs: food.carbs || 0,
        fat: food.fat || 0,
        fiber: food.fiber || 0,
    }, quantityG / 100);
}

/**
 * Macros totales de una receta a partir de sus ingredientes. Acepta la
 * receta mapeada por recipeService (con `ingredients: [{ food, quantity_g }]`)
 * o el embed crudo de Supabase (`recipe_food: [{ food, quantity_g }]`).
 */
export function recipeTotalMacros(recipe) {
    const ingredients = recipe.ingredients
        || (recipe.recipe_food || []).map(rel => rel);

    return sumMacros(ingredients.map(ingredient => foodMacros(ingredient.food, ingredient.quantity_g)));
}

/** Macros de una receta por ración (total / número de raciones). */
export function recipeServingMacros(recipe) {
    const servings = recipe.servings && recipe.servings > 0 ? recipe.servings : 1;
    return scaleMacros(recipeTotalMacros(recipe), 1 / servings);
}

/**
 * Macros de un ítem de un plan: referencia un alimento (con quantity_g) o
 * una receta (con servings).
 */
export function itemMacros(item) {
    if (item.food) {
        return foodMacros(item.food, item.quantity_g);
    }

    if (item.recipe) {
        const servings = item.servings && item.servings > 0 ? item.servings : 1;
        return scaleMacros(recipeServingMacros(item.recipe), servings);
    }

    return { ...EMPTY_MACROS };
}

/** Macros de una comida (slot) sumando sus ítems. */
export function slotMacros(slot) {
    return sumMacros((slot.items || []).map(itemMacros));
}

/** Macros de un día sumando sus comidas. */
export function dayMacros(day) {
    return sumMacros((day.slots || []).map(slotMacros));
}

/** "520 kcal · P 32 g · C 55 g · F 18 g" */
export function formatMacros(macros) {
    if (!macros) return '—';

    const round = (value) => Math.round((value || 0) * 10) / 10;

    return `${Math.round(macros.calories || 0)} kcal · P ${round(macros.protein)} g`
        + ` · C ${round(macros.carbs)} g · F ${round(macros.fat)} g`;
}

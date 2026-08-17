import { supabase } from '../supabaseClient.js';
import { getCurrentProfile } from '../utils/auth.js';

const PLAN_FULL_SELECT = `
    *,
    meal_plan_day(
        *,
        meal_plan_slot(
            *,
            meal_plan_item(
                *,
                food(*),
                recipe(*, recipe_food(food(*)))
            )
        )
    )
`;

// Valor temporal para intercambiar órdenes sin violar la restricción unique
// (padre, orden): se mueve la fila actual a -1, se libera su hueco y se
// recoloca.
const TEMP_ORDER = -1;

function mapPlan(plan) {
    const days = (plan.meal_plan_day || []).map(day => {
        const slots = (day.meal_plan_slot || []).map(slot => {
            const items = slot.meal_plan_item || [];
            const slotRest = { ...slot };
            delete slotRest.meal_plan_item;
            return { ...slotRest, items };
        });

        const dayRest = { ...day };
        delete dayRest.meal_plan_slot;
        return { ...dayRest, slots };
    });

    const planRest = { ...plan };
    delete planRest.meal_plan_day;
    return { ...planRest, days };
}

async function getMaxOrder(table, parentColumn, parentId, orderColumn) {
    const { data, error } = await supabase
        .from(table)
        .select(orderColumn)
        .eq(parentColumn, parentId)
        .order(orderColumn, { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? data[orderColumn] : 0;
}

/** Renumeración 1..N tras un borrado, para no dejar huecos en el orden. */
async function normalizeOrders(table, parentColumn, parentId, orderColumn) {
    const { data: rows, error } = await supabase
        .from(table)
        .select(`id, ${orderColumn}`)
        .eq(parentColumn, parentId)
        .order(orderColumn);

    if (error) throw new Error(error.message);

    for (let i = 0; i < rows.length; i += 1) {
        if (rows[i][orderColumn] !== i + 1) {
            const { error: updateError } = await supabase
                .from(table)
                .update({ [orderColumn]: i + 1 })
                .eq('id', rows[i].id);

            if (updateError) throw new Error(updateError.message);
        }
    }
}

/**
 * Mueve una fila una posición arriba (direction = -1) o abajo (+1)
 * intercambiando su orden con el vecino. Usa un valor temporal para no
 * chocar con la restricción unique (padre, orden).
 */
async function moveRow(table, rowId, parentColumn, orderColumn, direction) {
    const { data: row, error: rowError } = await supabase
        .from(table)
        .select(`id, ${parentColumn}, ${orderColumn}`)
        .eq('id', rowId)
        .single();

    if (rowError) throw new Error(rowError.message);

    const { data: siblings, error: siblingsError } = await supabase
        .from(table)
        .select(`id, ${orderColumn}`)
        .eq(parentColumn, row[parentColumn])
        .order(orderColumn);

    if (siblingsError) throw new Error(siblingsError.message);

    const index = siblings.findIndex(sibling => sibling.id === rowId);
    const targetIndex = index + direction;

    if (index === -1 || targetIndex < 0 || targetIndex >= siblings.length) {
        return;
    }

    const target = siblings[targetIndex];

    const { error: stepOneError } = await supabase
        .from(table)
        .update({ [orderColumn]: TEMP_ORDER })
        .eq('id', row.id);

    if (stepOneError) throw new Error(stepOneError.message);

    const { error: stepTwoError } = await supabase
        .from(table)
        .update({ [orderColumn]: row[orderColumn] })
        .eq('id', target.id);

    if (stepTwoError) throw new Error(stepTwoError.message);

    const { error: stepThreeError } = await supabase
        .from(table)
        .update({ [orderColumn]: target[orderColumn] })
        .eq('id', row.id);

    if (stepThreeError) throw new Error(stepThreeError.message);
}

export const mealPlanService = {
    async getClients() {
        const { data, error } = await supabase
            .from('profile')
            .select('id, name, surname')
            .eq('role', 'client')
            .order('name');

        if (error) throw new Error(error.message);
        return data || [];
    },

    async getAll() {
        const profile = await getCurrentProfile();

        const { data, error } = await supabase
            .from('meal_plan')
            .select('*, meal_plan_day(id), profile_has_meal_plan(profile(id, name, surname))')
            .eq('created_by', profile.id)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);

        return (data || []).map(plan => {
            const dayCount = plan.meal_plan_day?.length || 0;
            const clients = (plan.profile_has_meal_plan || [])
                .map(rel => rel.profile)
                .filter(Boolean);

            const rest = { ...plan };
            delete rest.meal_plan_day;
            delete rest.profile_has_meal_plan;
            return { ...rest, dayCount, clients };
        });
    },

    async getById(planId) {
        const { data, error } = await supabase
            .from('meal_plan')
            .select(`${PLAN_FULL_SELECT}, profile_has_meal_plan(profile(id, name, surname))`)
            .eq('id', planId)
            .order('day_order', { referencedTable: 'meal_plan_day' })
            .order('slot_order', { referencedTable: 'meal_plan_day.meal_plan_slot' })
            .order('item_order', { referencedTable: 'meal_plan_day.meal_plan_slot.meal_plan_item' })
            .single();

        if (error) throw new Error(error.message);

        const clients = (data.profile_has_meal_plan || [])
            .map(rel => rel.profile)
            .filter(Boolean);

        const rest = { ...data };
        delete rest.profile_has_meal_plan;
        return { ...mapPlan(rest), clients };
    },

    async getByClient(clientId) {
        const { data, error } = await supabase
            .from('meal_plan')
            .select(`${PLAN_FULL_SELECT}, profile_has_meal_plan!inner(profile_id)`)
            .eq('profile_has_meal_plan.profile_id', clientId)
            .order('created_at', { ascending: false })
            .order('day_order', { referencedTable: 'meal_plan_day' })
            .order('slot_order', { referencedTable: 'meal_plan_day.meal_plan_slot' })
            .order('item_order', { referencedTable: 'meal_plan_day.meal_plan_slot.meal_plan_item' });

        if (error) throw new Error(error.message);
        return (data || []).map(mapPlan);
    },

    async create(planData) {
        const profile = await getCurrentProfile();

        const { data: plan, error } = await supabase
            .from('meal_plan')
            .insert({
                title: planData.title,
                description: planData.description || null,
                target_calories: planData.target_calories ?? null,
                target_protein: planData.target_protein ?? null,
                target_carbs: planData.target_carbs ?? null,
                target_fat: planData.target_fat ?? null,
                created_by: profile.id,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);

        const { error: dayError } = await supabase
            .from('meal_plan_day')
            .insert({ meal_plan_id: plan.id, day_order: 1, label: 'Día 1' });

        if (dayError) throw new Error(dayError.message);

        return plan;
    },

    async update(planId, planData) {
        const { data, error } = await supabase
            .from('meal_plan')
            .update({
                title: planData.title,
                description: planData.description || null,
                target_calories: planData.target_calories ?? null,
                target_protein: planData.target_protein ?? null,
                target_carbs: planData.target_carbs ?? null,
                target_fat: planData.target_fat ?? null,
            })
            .eq('id', planId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    async delete(planId) {
        const { error } = await supabase
            .from('meal_plan')
            .delete()
            .eq('id', planId);

        if (error) throw new Error(error.message);
    },

    async assign(clientId, planId) {
        const { error } = await supabase
            .from('profile_has_meal_plan')
            .insert({ profile_id: clientId, meal_plan_id: planId });

        if (error && error.code !== '23505') {
            throw new Error(error.message);
        }
    },

    async unassign(clientId, planId) {
        const { error } = await supabase
            .from('profile_has_meal_plan')
            .delete()
            .eq('profile_id', clientId)
            .eq('meal_plan_id', planId);

        if (error) throw new Error(error.message);
    },

    async addDay(planId, label) {
        const maxOrder = await getMaxOrder('meal_plan_day', 'meal_plan_id', planId, 'day_order');

        const { data, error } = await supabase
            .from('meal_plan_day')
            .insert({
                meal_plan_id: planId,
                day_order: maxOrder + 1,
                label: label || `Día ${maxOrder + 1}`,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    async updateDay(dayId, fields) {
        const { data, error } = await supabase
            .from('meal_plan_day')
            .update({ label: fields.label })
            .eq('id', dayId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    async removeDay(dayId) {
        const { data: day, error: dayError } = await supabase
            .from('meal_plan_day')
            .select('id, meal_plan_id')
            .eq('id', dayId)
            .single();

        if (dayError) throw new Error(dayError.message);

        const { error } = await supabase
            .from('meal_plan_day')
            .delete()
            .eq('id', dayId);

        if (error) throw new Error(error.message);

        await normalizeOrders('meal_plan_day', 'meal_plan_id', day.meal_plan_id, 'day_order');
    },

    async moveDay(dayId, direction) {
        await moveRow('meal_plan_day', dayId, 'meal_plan_id', 'day_order', direction);
    },

    async copyDay(dayId) {
        const { data: day, error } = await supabase
            .from('meal_plan_day')
            .select('id, meal_plan_id, day_order, label, meal_plan_slot(*, meal_plan_item(*))')
            .eq('id', dayId)
            .order('slot_order', { referencedTable: 'meal_plan_slot' })
            .order('item_order', { referencedTable: 'meal_plan_slot.meal_plan_item' })
            .single();

        if (error) throw new Error(error.message);

        const maxOrder = await getMaxOrder('meal_plan_day', 'meal_plan_id', day.meal_plan_id, 'day_order');

        const { data: newDay, error: newDayError } = await supabase
            .from('meal_plan_day')
            .insert({
                meal_plan_id: day.meal_plan_id,
                day_order: maxOrder + 1,
                label: `${day.label || `Día ${day.day_order}`} (copia)`,
            })
            .select()
            .single();

        if (newDayError) throw new Error(newDayError.message);

        const slots = day.meal_plan_slot || [];

        if (slots.length === 0) {
            return newDay;
        }

        const { data: newSlots, error: slotsError } = await supabase
            .from('meal_plan_slot')
            .insert(slots.map(slot => ({
                day_id: newDay.id,
                slot_order: slot.slot_order,
                label: slot.label,
            })))
            .select();

        if (slotsError) throw new Error(slotsError.message);

        const itemRows = [];

        slots.forEach((slot, index) => {
            for (const item of slot.meal_plan_item || []) {
                itemRows.push({
                    slot_id: newSlots[index].id,
                    item_order: item.item_order,
                    recipe_id: item.recipe_id,
                    food_id: item.food_id,
                    quantity_g: item.quantity_g,
                    servings: item.servings,
                    notes: item.notes,
                });
            }
        });

        if (itemRows.length > 0) {
            const { error: itemsError } = await supabase
                .from('meal_plan_item')
                .insert(itemRows);

            if (itemsError) throw new Error(itemsError.message);
        }

        return newDay;
    },

    async addSlot(dayId, label) {
        const maxOrder = await getMaxOrder('meal_plan_slot', 'day_id', dayId, 'slot_order');

        const { data, error } = await supabase
            .from('meal_plan_slot')
            .insert({
                day_id: dayId,
                slot_order: maxOrder + 1,
                label: label || `Comida ${maxOrder + 1}`,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    async updateSlot(slotId, fields) {
        const { data, error } = await supabase
            .from('meal_plan_slot')
            .update({ label: fields.label })
            .eq('id', slotId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    async removeSlot(slotId) {
        const { data: slot, error: slotError } = await supabase
            .from('meal_plan_slot')
            .select('id, day_id')
            .eq('id', slotId)
            .single();

        if (slotError) throw new Error(slotError.message);

        const { error } = await supabase
            .from('meal_plan_slot')
            .delete()
            .eq('id', slotId);

        if (error) throw new Error(error.message);

        await normalizeOrders('meal_plan_slot', 'day_id', slot.day_id, 'slot_order');
    },

    async moveSlot(slotId, direction) {
        await moveRow('meal_plan_slot', slotId, 'day_id', 'slot_order', direction);
    },

    async addItem(slotId, itemData) {
        const maxOrder = await getMaxOrder('meal_plan_item', 'slot_id', slotId, 'item_order');

        const { data, error } = await supabase
            .from('meal_plan_item')
            .insert({
                slot_id: slotId,
                item_order: maxOrder + 1,
                recipe_id: itemData.recipe_id ?? null,
                food_id: itemData.food_id ?? null,
                quantity_g: itemData.quantity_g ?? null,
                servings: itemData.servings ?? null,
                notes: itemData.notes || null,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    async updateItem(itemId, fields) {
        const { data, error } = await supabase
            .from('meal_plan_item')
            .update({
                quantity_g: fields.quantity_g ?? null,
                servings: fields.servings ?? null,
                notes: fields.notes || null,
            })
            .eq('id', itemId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    async removeItem(itemId) {
        const { data: item, error: itemError } = await supabase
            .from('meal_plan_item')
            .select('id, slot_id')
            .eq('id', itemId)
            .single();

        if (itemError) throw new Error(itemError.message);

        const { error } = await supabase
            .from('meal_plan_item')
            .delete()
            .eq('id', itemId);

        if (error) throw new Error(error.message);

        await normalizeOrders('meal_plan_item', 'slot_id', item.slot_id, 'item_order');
    },

    async moveItem(itemId, direction) {
        await moveRow('meal_plan_item', itemId, 'slot_id', 'item_order', direction);
    },
};

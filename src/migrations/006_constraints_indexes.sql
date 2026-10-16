-- 006: acciones ON DELETE de las FK, UNIQUE compuestos, CHECK e índices
-- (reflejan lo que existe en producción)

-- ---------------------------------------------------------------
-- 1. Foreign keys: se recrean con su acción ON DELETE
-- ---------------------------------------------------------------
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      -- tabla, constraint, columna, tabla referenciada, acción
      ('initial_assessment', 'initial_assessment_profile_id_fkey', 'profile_id', 'profile', 'CASCADE'),
      ('measurement', 'measurement_profile_id_fkey', 'profile_id', 'profile', 'CASCADE'),
      ('check_in', 'check_in_profile_id_fkey', 'profile_id', 'profile', 'CASCADE'),
      ('avatar', 'avatar_profile_id_fkey', 'profile_id', 'profile', 'CASCADE'),
      ('body_photo', 'body_photo_profile_id_fkey', 'profile_id', 'profile', 'CASCADE'),
      ('routine_has_exercise_template', 'rutine_has_exercise_template_rutine_fkey', 'routine', 'routine', 'CASCADE'),
      ('routine_has_exercise_template', 'rutine_has_exercise_template_exercise_template_fkey', 'exercise_template', 'exercise_template', 'CASCADE'),
      ('exercise_template_has_set_template', 'exercise_template_has_set_template_exercise_template_fkey', 'exercise_template', 'exercise_template', 'CASCADE'),
      ('profile_has_routine', 'profile_has_routine_profile_fkey', 'profile', 'profile', 'CASCADE'),
      ('profile_has_routine', 'profile_has_routine_routine_fkey', 'routine', 'routine', 'CASCADE'),
      ('exercise_template_has_tag', 'exercise_template_has_tag_exercise_template_fkey', 'exercise_template', 'exercise_template', 'CASCADE'),
      ('training_session', 'training_session_profile_id_fkey', 'profile_id', 'profile', 'CASCADE'),
      ('completed_exercise', 'completed_exercise_session_id_fkey', 'session_id', 'training_session', 'CASCADE'),
      ('completed_set', 'completed_set_completed_exercise_id_fkey', 'completed_exercise_id', 'completed_exercise', 'CASCADE'),
      ('food_has_tag', 'food_has_tag_food_id_fkey', 'food_id', 'food', 'CASCADE'),
      ('food_has_tag', 'food_has_tag_tag_id_fkey', 'tag_id', 'tag', 'CASCADE'),
      ('recipe_food', 'recipe_food_recipe_id_fkey', 'recipe_id', 'recipe', 'CASCADE'),
      ('recipe_has_tag', 'recipe_has_tag_recipe_id_fkey', 'recipe_id', 'recipe', 'CASCADE'),
      ('recipe_has_tag', 'recipe_has_tag_tag_id_fkey', 'tag_id', 'tag', 'CASCADE'),
      ('profile_has_meal_plan', 'profile_has_meal_plan_profile_id_fkey', 'profile_id', 'profile', 'CASCADE'),
      ('profile_has_meal_plan', 'profile_has_meal_plan_meal_plan_id_fkey', 'meal_plan_id', 'meal_plan', 'CASCADE'),
      ('meal_plan_day', 'meal_plan_day_meal_plan_id_fkey', 'meal_plan_id', 'meal_plan', 'CASCADE'),
      ('meal_plan_slot', 'meal_plan_slot_day_id_fkey', 'day_id', 'meal_plan_day', 'CASCADE'),
      ('meal_plan_item', 'meal_plan_item_slot_id_fkey', 'slot_id', 'meal_plan_slot', 'CASCADE'),
      ('calendar_event', 'calendar_event_profile_id_fkey', 'profile_id', 'profile', 'CASCADE'),
      ('calendar_event_exception', 'calendar_event_exception_event_id_fkey', 'event_id', 'calendar_event', 'CASCADE'),
      ('exercise_template', 'exercise_template_creator_fkey', 'creator', 'profile', 'SET NULL'),
      ('routine', 'rutine_creator_fkey', 'creator', 'profile', 'SET NULL'),
      ('food', 'food_created_by_fkey', 'created_by', 'profile', 'SET NULL'),
      ('recipe', 'recipe_created_by_fkey', 'created_by', 'profile', 'SET NULL'),
      ('meal_plan', 'meal_plan_created_by_fkey', 'created_by', 'profile', 'SET NULL'),
      ('calendar_event', 'calendar_event_created_by_fkey', 'created_by', 'profile', 'SET NULL'),
      ('calendar_event', 'calendar_event_routine_id_fkey', 'routine_id', 'routine', 'SET NULL'),
      ('meal_plan_item', 'meal_plan_item_food_id_fkey', 'food_id', 'food', 'SET NULL'),
      ('meal_plan_item', 'meal_plan_item_recipe_id_fkey', 'recipe_id', 'recipe', 'SET NULL')
    ) AS t(tbl, con, col, ref, act)
  LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', r.tbl, r.con);
    EXECUTE format(
      'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.%I(id) ON DELETE %s',
      r.tbl, r.con, r.col, r.ref, r.act
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------
-- 2. UNIQUE compuestos y CHECK
-- ---------------------------------------------------------------
ALTER TABLE public.exercise_template_has_tag
  ADD CONSTRAINT exercise_template_has_tag_exercise_template_tag_key UNIQUE (exercise_template, tag);
ALTER TABLE public.completed_exercise
  ADD CONSTRAINT completed_exercise_unique_per_session UNIQUE (session_id, exercise_template_id);
ALTER TABLE public.completed_set
  ADD CONSTRAINT completed_set_unique_per_exercise UNIQUE (completed_exercise_id, set_order);
ALTER TABLE public.food_has_tag
  ADD CONSTRAINT food_has_tag_unique UNIQUE (food_id, tag_id);
ALTER TABLE public.recipe_food
  ADD CONSTRAINT recipe_food_unique UNIQUE (recipe_id, food_id);
ALTER TABLE public.recipe_has_tag
  ADD CONSTRAINT recipe_has_tag_unique UNIQUE (recipe_id, tag_id);
ALTER TABLE public.profile_has_meal_plan
  ADD CONSTRAINT profile_has_meal_plan_unique UNIQUE (profile_id, meal_plan_id);
ALTER TABLE public.meal_plan_day
  ADD CONSTRAINT meal_plan_day_unique_order UNIQUE (meal_plan_id, day_order);
ALTER TABLE public.meal_plan_slot
  ADD CONSTRAINT meal_plan_slot_unique_order UNIQUE (day_id, slot_order);
ALTER TABLE public.meal_plan_item
  ADD CONSTRAINT meal_plan_item_unique_order UNIQUE (slot_id, item_order);

ALTER TABLE public.meal_plan_item
  ADD CONSTRAINT meal_plan_item_check CHECK (recipe_id IS NOT NULL OR food_id IS NOT NULL);

-- ---------------------------------------------------------------
-- 3. Índices
-- ---------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_body_photo_profile_id ON public.body_photo USING btree (profile_id);
CREATE INDEX IF NOT EXISTS idx_body_photo_taken_at ON public.body_photo USING btree (taken_at);
CREATE INDEX IF NOT EXISTS idx_calendar_event_profile_dtstart ON public.calendar_event USING btree (profile_id, dtstart);
CREATE INDEX IF NOT EXISTS idx_calendar_event_exception_event ON public.calendar_event_exception USING btree (event_id);
CREATE INDEX IF NOT EXISTS idx_check_in_profile_created ON public.check_in USING btree (profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_role ON public.profile USING btree (role);
CREATE INDEX IF NOT EXISTS training_session_profile_status_idx ON public.training_session USING btree (profile_id, status);

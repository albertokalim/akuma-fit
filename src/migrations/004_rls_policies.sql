-- 004: activar RLS en todas las tablas de public y crear sus políticas.
-- Requiere 003 (is_coach, get_profile_id).

ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initial_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_in ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_photo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_has_exercise_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_template_has_set_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_has_routine ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_template_has_tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_exercise ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_set ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_has_tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_food ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_has_tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_has_meal_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_day ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_slot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_exception ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- profile
-- ---------------------------------------------------------------------------
CREATE POLICY "profile_insert_own" ON public.profile AS PERMISSIVE FOR INSERT TO public
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profile_select_own" ON public.profile AS PERMISSIVE FOR SELECT TO public
    USING (user_id = auth.uid());
CREATE POLICY "profile_update_own" ON public.profile AS PERMISSIVE FOR UPDATE TO public
    USING (user_id = auth.uid());
CREATE POLICY "Coaches can view all profiles" ON public.profile AS PERMISSIVE FOR SELECT TO public
    USING (is_coach());
CREATE POLICY "Enable read for users based on user_id" ON public.profile AS PERMISSIVE FOR SELECT TO public
    USING (user_id = auth.uid());
CREATE POLICY "Enable insert for users based on user_id" ON public.profile AS PERMISSIVE FOR INSERT TO public
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "Enable update for users based on user_id" ON public.profile AS PERMISSIVE FOR UPDATE TO public
    USING (user_id = auth.uid());
CREATE POLICY "Enable delete for users based on user_id" ON public.profile AS PERMISSIVE FOR DELETE TO public
    USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- initial_assessment
-- ---------------------------------------------------------------------------
CREATE POLICY "assessment_insert_own" ON public.initial_assessment AS PERMISSIVE FOR INSERT TO public
    WITH CHECK (profile_id IN (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "assessment_select_own" ON public.initial_assessment AS PERMISSIVE FOR SELECT TO public
    USING (profile_id IN (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "assessment_update_own" ON public.initial_assessment AS PERMISSIVE FOR UPDATE TO public
    USING (profile_id IN (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- measurement
-- ---------------------------------------------------------------------------
CREATE POLICY "measurement_insert_own" ON public.measurement AS PERMISSIVE FOR INSERT TO public
    WITH CHECK (profile_id IN (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "measurement_select_own" ON public.measurement AS PERMISSIVE FOR SELECT TO public
    USING (profile_id IN (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "measurement_update_own" ON public.measurement AS PERMISSIVE FOR UPDATE TO public
    USING (profile_id IN (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "measurement_select_coach" ON public.measurement AS PERMISSIVE FOR SELECT TO public
    USING (is_coach());

-- ---------------------------------------------------------------------------
-- check_in
-- ---------------------------------------------------------------------------
CREATE POLICY "check_in_insert_own" ON public.check_in AS PERMISSIVE FOR INSERT TO public
    WITH CHECK (profile_id IN (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "check_in_select_own" ON public.check_in AS PERMISSIVE FOR SELECT TO public
    USING (profile_id IN (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "check_in_update_own" ON public.check_in AS PERMISSIVE FOR UPDATE TO public
    USING (profile_id IN (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "Coaches can view all check-ins" ON public.check_in AS PERMISSIVE FOR SELECT TO public
    USING (is_coach());

-- ---------------------------------------------------------------------------
-- avatar
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view own avatar" ON public.avatar AS PERMISSIVE FOR SELECT TO public
    USING (profile_id IN (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "Users can insert own avatar" ON public.avatar AS PERMISSIVE FOR INSERT TO public
    WITH CHECK (profile_id IN (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "Users can update own avatar" ON public.avatar AS PERMISSIVE FOR UPDATE TO public
    USING (profile_id IN (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "Users can delete own avatar" ON public.avatar AS PERMISSIVE FOR DELETE TO public
    USING (profile_id IN (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- body_photo
-- ---------------------------------------------------------------------------
CREATE POLICY "Clients can view own photos" ON public.body_photo AS PERMISSIVE FOR SELECT TO public
    USING (profile_id IN (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "Clients can insert own photos" ON public.body_photo AS PERMISSIVE FOR INSERT TO public
    WITH CHECK (profile_id IN (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "Clients can delete own photos" ON public.body_photo AS PERMISSIVE FOR DELETE TO public
    USING (profile_id IN (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "Coaches can view client photos" ON public.body_photo AS PERMISSIVE FOR SELECT TO public
    USING (EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role));
CREATE POLICY "body_photo_select_coach" ON public.body_photo AS PERMISSIVE FOR SELECT TO public
    USING (is_coach());

-- ---------------------------------------------------------------------------
-- training_session
-- ---------------------------------------------------------------------------
CREATE POLICY "training_session_select_own" ON public.training_session AS PERMISSIVE FOR SELECT TO authenticated
    USING (profile_id = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "training_session_insert_own" ON public.training_session AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (profile_id = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "training_session_update_own" ON public.training_session AS PERMISSIVE FOR UPDATE TO authenticated
    USING (profile_id = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()))
    WITH CHECK (profile_id = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "training_session_delete_own" ON public.training_session AS PERMISSIVE FOR DELETE TO authenticated
    USING (profile_id = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- completed_exercise
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view their own completed exercises" ON public.completed_exercise AS PERMISSIVE FOR SELECT TO public
    USING (EXISTS (
        SELECT 1 FROM training_session ts JOIN profile p ON ts.profile_id = p.id
        WHERE ts.id = completed_exercise.session_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can insert completed exercises for their sessions" ON public.completed_exercise AS PERMISSIVE FOR INSERT TO public
    WITH CHECK (EXISTS (
        SELECT 1 FROM training_session ts JOIN profile p ON ts.profile_id = p.id
        WHERE ts.id = completed_exercise.session_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can update their own completed exercises" ON public.completed_exercise AS PERMISSIVE FOR UPDATE TO public
    USING (EXISTS (
        SELECT 1 FROM training_session ts JOIN profile p ON ts.profile_id = p.id
        WHERE ts.id = completed_exercise.session_id AND p.user_id = auth.uid()))
    WITH CHECK (EXISTS (
        SELECT 1 FROM training_session ts JOIN profile p ON ts.profile_id = p.id
        WHERE ts.id = completed_exercise.session_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can delete their own completed exercises" ON public.completed_exercise AS PERMISSIVE FOR DELETE TO public
    USING (EXISTS (
        SELECT 1 FROM training_session ts JOIN profile p ON ts.profile_id = p.id
        WHERE ts.id = completed_exercise.session_id AND p.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- completed_set
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view their own completed sets" ON public.completed_set AS PERMISSIVE FOR SELECT TO public
    USING (EXISTS (
        SELECT 1 FROM completed_exercise ce
            JOIN training_session ts ON ce.session_id = ts.id
            JOIN profile p ON ts.profile_id = p.id
        WHERE ce.id = completed_set.completed_exercise_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can insert completed sets for their exercises" ON public.completed_set AS PERMISSIVE FOR INSERT TO public
    WITH CHECK (EXISTS (
        SELECT 1 FROM completed_exercise ce
            JOIN training_session ts ON ce.session_id = ts.id
            JOIN profile p ON ts.profile_id = p.id
        WHERE ce.id = completed_set.completed_exercise_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can update their own completed sets" ON public.completed_set AS PERMISSIVE FOR UPDATE TO public
    USING (EXISTS (
        SELECT 1 FROM completed_exercise ce
            JOIN training_session ts ON ce.session_id = ts.id
            JOIN profile p ON ts.profile_id = p.id
        WHERE ce.id = completed_set.completed_exercise_id AND p.user_id = auth.uid()))
    WITH CHECK (EXISTS (
        SELECT 1 FROM completed_exercise ce
            JOIN training_session ts ON ce.session_id = ts.id
            JOIN profile p ON ts.profile_id = p.id
        WHERE ce.id = completed_set.completed_exercise_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can delete their own completed sets" ON public.completed_set AS PERMISSIVE FOR DELETE TO public
    USING (EXISTS (
        SELECT 1 FROM completed_exercise ce
            JOIN training_session ts ON ce.session_id = ts.id
            JOIN profile p ON ts.profile_id = p.id
        WHERE ce.id = completed_set.completed_exercise_id AND p.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- calendar_event
-- ---------------------------------------------------------------------------
CREATE POLICY "Coaches can select all calendar_events" ON public.calendar_event AS PERMISSIVE FOR SELECT TO public
    USING (EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role));
CREATE POLICY "Coaches can insert calendar_events" ON public.calendar_event AS PERMISSIVE FOR INSERT TO public
    WITH CHECK (EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role));
CREATE POLICY "Coaches can update calendar_events" ON public.calendar_event AS PERMISSIVE FOR UPDATE TO public
    USING (EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role))
    WITH CHECK (EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role));
CREATE POLICY "Coaches can delete calendar_events" ON public.calendar_event AS PERMISSIVE FOR DELETE TO public
    USING (EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role));
CREATE POLICY "Users can select their own calendar_events" ON public.calendar_event AS PERMISSIVE FOR SELECT TO public
    USING ((SELECT profile.user_id FROM profile WHERE profile.id = calendar_event.profile_id) = auth.uid());
CREATE POLICY "Users can insert calendar_events for their profile" ON public.calendar_event AS PERMISSIVE FOR INSERT TO public
    WITH CHECK (
        (SELECT profile.user_id FROM profile WHERE profile.id = calendar_event.profile_id) = auth.uid()
        AND (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()) = created_by);
CREATE POLICY "Users can update their own calendar_events" ON public.calendar_event AS PERMISSIVE FOR UPDATE TO public
    USING ((SELECT profile.user_id FROM profile WHERE profile.id = calendar_event.profile_id) = auth.uid())
    WITH CHECK (
        (SELECT profile.user_id FROM profile WHERE profile.id = calendar_event.profile_id) = auth.uid()
        AND created_by = (
            SELECT calendar_event_old.created_by FROM calendar_event calendar_event_old
            WHERE calendar_event_old.id = calendar_event.id));
CREATE POLICY "Users can delete their own calendar_events" ON public.calendar_event AS PERMISSIVE FOR DELETE TO public
    USING ((SELECT profile.user_id FROM profile WHERE profile.id = calendar_event.profile_id) = auth.uid());

-- ---------------------------------------------------------------------------
-- calendar_event_exception
-- ---------------------------------------------------------------------------
CREATE POLICY "Coaches can select calendar_event_exceptions" ON public.calendar_event_exception AS PERMISSIVE FOR SELECT TO public
    USING (EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role));
CREATE POLICY "Coaches can insert calendar_event_exceptions" ON public.calendar_event_exception AS PERMISSIVE FOR INSERT TO public
    WITH CHECK (EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role));
CREATE POLICY "Coaches can update calendar_event_exceptions" ON public.calendar_event_exception AS PERMISSIVE FOR UPDATE TO public
    USING (EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role))
    WITH CHECK (EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role));
CREATE POLICY "Coaches can delete calendar_event_exceptions" ON public.calendar_event_exception AS PERMISSIVE FOR DELETE TO public
    USING (EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role));
CREATE POLICY "Users can select calendar_event_exceptions for their events" ON public.calendar_event_exception AS PERMISSIVE FOR SELECT TO public
    USING ((
        SELECT profile.user_id FROM profile
        WHERE profile.id = (SELECT calendar_event.profile_id FROM calendar_event WHERE calendar_event.id = calendar_event_exception.event_id)
    ) = auth.uid());
CREATE POLICY "Users can insert calendar_event_exceptions for their events" ON public.calendar_event_exception AS PERMISSIVE FOR INSERT TO public
    WITH CHECK ((
        SELECT profile.user_id FROM profile
        WHERE profile.id = (SELECT calendar_event.profile_id FROM calendar_event WHERE calendar_event.id = calendar_event_exception.event_id)
    ) = auth.uid());
CREATE POLICY "Users can update calendar_event_exceptions for their events" ON public.calendar_event_exception AS PERMISSIVE FOR UPDATE TO public
    USING ((
        SELECT profile.user_id FROM profile
        WHERE profile.id = (SELECT calendar_event.profile_id FROM calendar_event WHERE calendar_event.id = calendar_event_exception.event_id)
    ) = auth.uid())
    WITH CHECK (
        (
            SELECT profile.user_id FROM profile
            WHERE profile.id = (SELECT calendar_event.profile_id FROM calendar_event WHERE calendar_event.id = calendar_event_exception.event_id)
        ) = auth.uid()
        AND event_id = (
            SELECT calendar_event_exception_old.event_id FROM calendar_event_exception calendar_event_exception_old
            WHERE calendar_event_exception_old.id = calendar_event_exception.id));
CREATE POLICY "Users can delete calendar_event_exceptions for their events" ON public.calendar_event_exception AS PERMISSIVE FOR DELETE TO public
    USING ((
        SELECT profile.user_id FROM profile
        WHERE profile.id = (SELECT calendar_event.profile_id FROM calendar_event WHERE calendar_event.id = calendar_event_exception.event_id)
    ) = auth.uid());

-- ---------------------------------------------------------------------------
-- Nutrición: food, food_has_tag, recipe, recipe_food, recipe_has_tag,
-- meal_plan, meal_plan_day, meal_plan_slot, meal_plan_item, profile_has_meal_plan
-- ---------------------------------------------------------------------------
CREATE POLICY "food_coach_all" ON public.food AS PERMISSIVE FOR ALL TO public
    USING (is_coach()) WITH CHECK (is_coach());
CREATE POLICY "food_client_select" ON public.food AS PERMISSIVE FOR SELECT TO public
    USING (
        id IN (
            SELECT mpi.food_id
            FROM meal_plan_item mpi
                JOIN meal_plan_slot ms ON ms.id = mpi.slot_id
                JOIN meal_plan_day md ON md.id = ms.day_id
                JOIN profile_has_meal_plan phm ON phm.meal_plan_id = md.meal_plan_id
            WHERE phm.profile_id = get_profile_id() AND mpi.food_id IS NOT NULL)
        OR id IN (
            SELECT rf.food_id
            FROM recipe_food rf
                JOIN meal_plan_item mpi ON mpi.recipe_id = rf.recipe_id
                JOIN meal_plan_slot ms ON ms.id = mpi.slot_id
                JOIN meal_plan_day md ON md.id = ms.day_id
                JOIN profile_has_meal_plan phm ON phm.meal_plan_id = md.meal_plan_id
            WHERE phm.profile_id = get_profile_id()));

CREATE POLICY "food_has_tag_coach_all" ON public.food_has_tag AS PERMISSIVE FOR ALL TO public
    USING (is_coach()) WITH CHECK (is_coach());
CREATE POLICY "food_has_tag_client_select" ON public.food_has_tag AS PERMISSIVE FOR SELECT TO public
    USING (
        food_id IN (
            SELECT mpi.food_id
            FROM meal_plan_item mpi
                JOIN meal_plan_slot ms ON ms.id = mpi.slot_id
                JOIN meal_plan_day md ON md.id = ms.day_id
                JOIN profile_has_meal_plan phm ON phm.meal_plan_id = md.meal_plan_id
            WHERE phm.profile_id = get_profile_id() AND mpi.food_id IS NOT NULL)
        OR food_id IN (
            SELECT rf.food_id
            FROM recipe_food rf
                JOIN meal_plan_item mpi ON mpi.recipe_id = rf.recipe_id
                JOIN meal_plan_slot ms ON ms.id = mpi.slot_id
                JOIN meal_plan_day md ON md.id = ms.day_id
                JOIN profile_has_meal_plan phm ON phm.meal_plan_id = md.meal_plan_id
            WHERE phm.profile_id = get_profile_id()));

CREATE POLICY "recipe_coach_all" ON public.recipe AS PERMISSIVE FOR ALL TO public
    USING (is_coach()) WITH CHECK (is_coach());
CREATE POLICY "recipe_client_select" ON public.recipe AS PERMISSIVE FOR SELECT TO public
    USING (id IN (
        SELECT mpi.recipe_id
        FROM meal_plan_item mpi
            JOIN meal_plan_slot ms ON ms.id = mpi.slot_id
            JOIN meal_plan_day md ON md.id = ms.day_id
            JOIN profile_has_meal_plan phm ON phm.meal_plan_id = md.meal_plan_id
        WHERE phm.profile_id = get_profile_id() AND mpi.recipe_id IS NOT NULL));

CREATE POLICY "recipe_food_coach_all" ON public.recipe_food AS PERMISSIVE FOR ALL TO public
    USING (is_coach()) WITH CHECK (is_coach());
CREATE POLICY "recipe_food_client_select" ON public.recipe_food AS PERMISSIVE FOR SELECT TO public
    USING (recipe_id IN (
        SELECT mpi.recipe_id
        FROM meal_plan_item mpi
            JOIN meal_plan_slot ms ON ms.id = mpi.slot_id
            JOIN meal_plan_day md ON md.id = ms.day_id
            JOIN profile_has_meal_plan phm ON phm.meal_plan_id = md.meal_plan_id
        WHERE phm.profile_id = get_profile_id() AND mpi.recipe_id IS NOT NULL));

CREATE POLICY "recipe_has_tag_coach_all" ON public.recipe_has_tag AS PERMISSIVE FOR ALL TO public
    USING (is_coach()) WITH CHECK (is_coach());
CREATE POLICY "recipe_has_tag_client_select" ON public.recipe_has_tag AS PERMISSIVE FOR SELECT TO public
    USING (recipe_id IN (
        SELECT mpi.recipe_id
        FROM meal_plan_item mpi
            JOIN meal_plan_slot ms ON ms.id = mpi.slot_id
            JOIN meal_plan_day md ON md.id = ms.day_id
            JOIN profile_has_meal_plan phm ON phm.meal_plan_id = md.meal_plan_id
        WHERE phm.profile_id = get_profile_id() AND mpi.recipe_id IS NOT NULL));

CREATE POLICY "meal_plan_coach_all" ON public.meal_plan AS PERMISSIVE FOR ALL TO public
    USING (is_coach()) WITH CHECK (is_coach());
CREATE POLICY "meal_plan_client_select" ON public.meal_plan AS PERMISSIVE FOR SELECT TO public
    USING (id IN (SELECT phm.meal_plan_id FROM profile_has_meal_plan phm WHERE phm.profile_id = get_profile_id()));

CREATE POLICY "meal_plan_day_coach_all" ON public.meal_plan_day AS PERMISSIVE FOR ALL TO public
    USING (is_coach()) WITH CHECK (is_coach());
CREATE POLICY "meal_plan_day_client_select" ON public.meal_plan_day AS PERMISSIVE FOR SELECT TO public
    USING (meal_plan_id IN (SELECT phm.meal_plan_id FROM profile_has_meal_plan phm WHERE phm.profile_id = get_profile_id()));

CREATE POLICY "meal_plan_slot_coach_all" ON public.meal_plan_slot AS PERMISSIVE FOR ALL TO public
    USING (is_coach()) WITH CHECK (is_coach());
CREATE POLICY "meal_plan_slot_client_select" ON public.meal_plan_slot AS PERMISSIVE FOR SELECT TO public
    USING (day_id IN (
        SELECT md.id
        FROM meal_plan_day md
            JOIN profile_has_meal_plan phm ON phm.meal_plan_id = md.meal_plan_id
        WHERE phm.profile_id = get_profile_id()));

CREATE POLICY "meal_plan_item_coach_all" ON public.meal_plan_item AS PERMISSIVE FOR ALL TO public
    USING (is_coach()) WITH CHECK (is_coach());
CREATE POLICY "meal_plan_item_client_select" ON public.meal_plan_item AS PERMISSIVE FOR SELECT TO public
    USING (slot_id IN (
        SELECT ms.id
        FROM meal_plan_slot ms
            JOIN meal_plan_day md ON md.id = ms.day_id
            JOIN profile_has_meal_plan phm ON phm.meal_plan_id = md.meal_plan_id
        WHERE phm.profile_id = get_profile_id()));

CREATE POLICY "profile_has_meal_plan_coach_all" ON public.profile_has_meal_plan AS PERMISSIVE FOR ALL TO public
    USING (is_coach()) WITH CHECK (is_coach());
CREATE POLICY "profile_has_meal_plan_client_select" ON public.profile_has_meal_plan AS PERMISSIVE FOR SELECT TO public
    USING (profile_id = get_profile_id());

-- ---------------------------------------------------------------------------
-- Entrenamiento: exercise_template, routine, set_template, tag y tablas puente
-- ---------------------------------------------------------------------------
CREATE POLICY "exercise_template_select_own" ON public.exercise_template AS PERMISSIVE FOR SELECT TO authenticated
    USING (creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "exercise_template_insert_own" ON public.exercise_template AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "exercise_template_update_own" ON public.exercise_template AS PERMISSIVE FOR UPDATE TO authenticated
    USING (creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()))
    WITH CHECK (creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "exercise_template_delete_own" ON public.exercise_template AS PERMISSIVE FOR DELETE TO authenticated
    USING (creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "exercise_template_select_assigned" ON public.exercise_template AS PERMISSIVE FOR SELECT TO authenticated
    USING (id IN (
        SELECT routine_has_exercise_template.exercise_template
        FROM routine_has_exercise_template
        WHERE routine_has_exercise_template.routine IN (
            SELECT profile_has_routine.routine
            FROM profile_has_routine
            WHERE profile_has_routine.profile = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()))));

CREATE POLICY "routine_select_own" ON public.routine AS PERMISSIVE FOR SELECT TO authenticated
    USING (creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "routine_insert_own" ON public.routine AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "routine_update_own" ON public.routine AS PERMISSIVE FOR UPDATE TO authenticated
    USING (creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()))
    WITH CHECK (creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "routine_delete_own" ON public.routine AS PERMISSIVE FOR DELETE TO authenticated
    USING (creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "routine_select_assigned" ON public.routine AS PERMISSIVE FOR SELECT TO authenticated
    USING (id IN (
        SELECT profile_has_routine.routine
        FROM profile_has_routine
        WHERE profile_has_routine.profile = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())));

CREATE POLICY "set_template_select_all" ON public.set_template AS PERMISSIVE FOR SELECT TO authenticated
    USING (true);
CREATE POLICY "set_template_insert_all" ON public.set_template AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (true);
CREATE POLICY "set_template_update_all" ON public.set_template AS PERMISSIVE FOR UPDATE TO authenticated
    USING (true) WITH CHECK (true);
CREATE POLICY "set_template_delete_all" ON public.set_template AS PERMISSIVE FOR DELETE TO authenticated
    USING (true);
CREATE POLICY "set_template_select_assigned" ON public.set_template AS PERMISSIVE FOR SELECT TO authenticated
    USING (id IN (
        SELECT exercise_template_has_set_template.set_template
        FROM exercise_template_has_set_template
        WHERE exercise_template_has_set_template.exercise_template IN (
            SELECT routine_has_exercise_template.exercise_template
            FROM routine_has_exercise_template
            WHERE routine_has_exercise_template.routine IN (
                SELECT profile_has_routine.routine
                FROM profile_has_routine
                WHERE profile_has_routine.profile = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())))));

CREATE POLICY "tag_select_all" ON public.tag AS PERMISSIVE FOR SELECT TO authenticated
    USING (true);
CREATE POLICY "tag_insert_all" ON public.tag AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (true);
CREATE POLICY "tag_update_all" ON public.tag AS PERMISSIVE FOR UPDATE TO authenticated
    USING (true) WITH CHECK (true);
CREATE POLICY "tag_delete_all" ON public.tag AS PERMISSIVE FOR DELETE TO authenticated
    USING (true);

CREATE POLICY "profile_has_routine_select_access" ON public.profile_has_routine AS PERMISSIVE FOR SELECT TO authenticated
    USING (
        profile = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role));
CREATE POLICY "profile_has_routine_insert_access" ON public.profile_has_routine AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (
        profile = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role));
CREATE POLICY "profile_has_routine_update_access" ON public.profile_has_routine AS PERMISSIVE FOR UPDATE TO authenticated
    USING (
        profile = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role))
    WITH CHECK (
        profile = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role));
CREATE POLICY "profile_has_routine_delete_access" ON public.profile_has_routine AS PERMISSIVE FOR DELETE TO authenticated
    USING (
        profile = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role));

CREATE POLICY "routine_has_exercise_template_select_own" ON public.routine_has_exercise_template AS PERMISSIVE FOR SELECT TO authenticated
    USING (routine IN (
        SELECT r.id FROM routine r JOIN profile_has_routine phr ON phr.routine = r.id
        WHERE phr.profile = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())));
CREATE POLICY "routine_has_exercise_template_insert_own" ON public.routine_has_exercise_template AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (routine IN (
        SELECT r.id FROM routine r JOIN profile_has_routine phr ON phr.routine = r.id
        WHERE phr.profile = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())));
CREATE POLICY "routine_has_exercise_template_update_own" ON public.routine_has_exercise_template AS PERMISSIVE FOR UPDATE TO authenticated
    USING (routine IN (
        SELECT r.id FROM routine r JOIN profile_has_routine phr ON phr.routine = r.id
        WHERE phr.profile = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())))
    WITH CHECK (routine IN (
        SELECT r.id FROM routine r JOIN profile_has_routine phr ON phr.routine = r.id
        WHERE phr.profile = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())));
CREATE POLICY "routine_has_exercise_template_delete_own" ON public.routine_has_exercise_template AS PERMISSIVE FOR DELETE TO authenticated
    USING (routine IN (
        SELECT r.id FROM routine r JOIN profile_has_routine phr ON phr.routine = r.id
        WHERE phr.profile = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())));
CREATE POLICY "routine_has_exercise_template_select_all" ON public.routine_has_exercise_template AS PERMISSIVE FOR SELECT TO authenticated
    USING (true);
CREATE POLICY "routine_has_exercise_template_insert_coach" ON public.routine_has_exercise_template AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role));
CREATE POLICY "routine_has_exercise_template_update_coach" ON public.routine_has_exercise_template AS PERMISSIVE FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role))
    WITH CHECK (EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role));
CREATE POLICY "routine_has_exercise_template_delete_coach" ON public.routine_has_exercise_template AS PERMISSIVE FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM profile WHERE profile.user_id = auth.uid() AND profile.role = 'coach'::role));
CREATE POLICY "routine_has_exercise_template_select_assigned" ON public.routine_has_exercise_template AS PERMISSIVE FOR SELECT TO authenticated
    USING (routine IN (
        SELECT profile_has_routine.routine
        FROM profile_has_routine
        WHERE profile_has_routine.profile = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())));

CREATE POLICY "exercise_template_has_set_template_select_own" ON public.exercise_template_has_set_template AS PERMISSIVE FOR SELECT TO authenticated
    USING (exercise_template IN (
        SELECT et.id FROM exercise_template et
        WHERE et.creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())));
CREATE POLICY "exercise_template_has_set_template_insert_own" ON public.exercise_template_has_set_template AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (exercise_template IN (
        SELECT et.id FROM exercise_template et
        WHERE et.creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())));
CREATE POLICY "exercise_template_has_set_template_update_own" ON public.exercise_template_has_set_template AS PERMISSIVE FOR UPDATE TO authenticated
    USING (exercise_template IN (
        SELECT et.id FROM exercise_template et
        WHERE et.creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())))
    WITH CHECK (exercise_template IN (
        SELECT et.id FROM exercise_template et
        WHERE et.creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())));
CREATE POLICY "exercise_template_has_set_template_delete_own" ON public.exercise_template_has_set_template AS PERMISSIVE FOR DELETE TO authenticated
    USING (exercise_template IN (
        SELECT et.id FROM exercise_template et
        WHERE et.creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())));
CREATE POLICY "exercise_template_has_set_template_select_assigned" ON public.exercise_template_has_set_template AS PERMISSIVE FOR SELECT TO authenticated
    USING (exercise_template IN (
        SELECT routine_has_exercise_template.exercise_template
        FROM routine_has_exercise_template
        WHERE routine_has_exercise_template.routine IN (
            SELECT profile_has_routine.routine
            FROM profile_has_routine
            WHERE profile_has_routine.profile = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid()))));

CREATE POLICY "exercise_template_has_tag_select_own" ON public.exercise_template_has_tag AS PERMISSIVE FOR SELECT TO authenticated
    USING (exercise_template IN (
        SELECT et.id FROM exercise_template et
        WHERE et.creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())));
CREATE POLICY "exercise_template_has_tag_insert_own" ON public.exercise_template_has_tag AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (exercise_template IN (
        SELECT et.id FROM exercise_template et
        WHERE et.creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())));
CREATE POLICY "exercise_template_has_tag_update_own" ON public.exercise_template_has_tag AS PERMISSIVE FOR UPDATE TO authenticated
    USING (exercise_template IN (
        SELECT et.id FROM exercise_template et
        WHERE et.creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())))
    WITH CHECK (exercise_template IN (
        SELECT et.id FROM exercise_template et
        WHERE et.creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())));
CREATE POLICY "exercise_template_has_tag_delete_own" ON public.exercise_template_has_tag AS PERMISSIVE FOR DELETE TO authenticated
    USING (exercise_template IN (
        SELECT et.id FROM exercise_template et
        WHERE et.creator = (SELECT profile.id FROM profile WHERE profile.user_id = auth.uid())));

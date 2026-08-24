CREATE TABLE public.profile (
                                id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                user_id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
                                name text NOT NULL DEFAULT 'no name'::text,
                                surname text NOT NULL DEFAULT 'no surname'::text,
                                role USER-DEFINED NOT NULL DEFAULT 'client'::role,
                                birthdate date,
                                gender USER-DEFINED,
                                CONSTRAINT profile_pkey PRIMARY KEY (id),
                                CONSTRAINT profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.initial_assessment (
                                           id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                           created_at timestamp with time zone NOT NULL DEFAULT now(),
                                           goals character varying,
                                           deadline character varying,
                                           motivation_level smallint,
                                           past character varying,
                                           current_level character varying,
                                           training_freq character varying,
                                           time_per_session character varying,
                                           where character varying,
                                           equipment character varying,
                                           disease character varying,
                                           medication character varying,
                                           current_injuries character varying,
                                           medical_restrictions character varying,
                                           daily_activity character varying,
                                           sleep_time character varying,
                                           current_stress_level smallint,
                                           current_diet character varying,
                                           food_restrictions character varying,
                                           water character varying,
                                           expected_adherence smallint,
                                           profile_id bigint UNIQUE,
                                           height double precision NOT NULL,
                                           data_consent boolean NOT NULL DEFAULT false,
                                           CONSTRAINT initial_assessment_pkey PRIMARY KEY (id),
                                           CONSTRAINT initial_assessment_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id)
);
CREATE TABLE public.measurement (
                                    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                    created_at timestamp with time zone NOT NULL DEFAULT now(),
                                    weight double precision NOT NULL,
                                    profile_id bigint NOT NULL,
                                    chest double precision,
                                    waist double precision,
                                    hip double precision,
                                    CONSTRAINT measurement_pkey PRIMARY KEY (id),
                                    CONSTRAINT measurement_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id)
);
CREATE TABLE public.check_in (
                                 id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                 created_at timestamp with time zone NOT NULL DEFAULT now(),
                                 how_do_you_feel character varying NOT NULL,
                                 hunger_level smallint NOT NULL,
                                 rest_quality smallint NOT NULL,
                                 comments character varying,
                                 profile_id bigint NOT NULL,
                                 diet_adherence USER-DEFINED NOT NULL,
                                 training_adherence USER-DEFINED NOT NULL,
                                 diet_adherence_reason text,
                                 training_adherence_reason text,
                                 gym_performance integer NOT NULL,
                                 avg_daily_steps text,
                                 cardio_adherence text NOT NULL,
                                 avg_sleep_hours text,
                                 energy_level integer NOT NULL,
                                 next_week_goal text,
                                 CONSTRAINT check_in_pkey PRIMARY KEY (id),
                                 CONSTRAINT check_in_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id)
);
CREATE TABLE public.exercise_template (
                                          id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                          exercise_name character varying,
                                          description character varying,
                                          comments character varying,
                                          category character varying,
                                          creator bigint NOT NULL,
                                          CONSTRAINT exercise_template_pkey PRIMARY KEY (id),
                                          CONSTRAINT exercise_template_creator_fkey FOREIGN KEY (creator) REFERENCES public.profile(id)
);
CREATE TABLE public.avatar (
                               id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                               profile_id bigint,
                               avatar_uid uuid DEFAULT gen_random_uuid(),
                               CONSTRAINT avatar_pkey PRIMARY KEY (id),
                               CONSTRAINT avatar_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id)
);
CREATE TABLE public.body_photo (
                                   id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                   created_at timestamp with time zone NOT NULL DEFAULT now(),
                                   profile_id bigint,
                                   position text,
                                   storage_path text,
                                   taken_at date NOT NULL,
                                   CONSTRAINT body_photo_pkey PRIMARY KEY (id),
                                   CONSTRAINT body_photo_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id)
);
CREATE TABLE public.routine (
                                id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                title character varying,
                                coach_comment character varying,
                                creator bigint NOT NULL,
                                created_at timestamp without time zone NOT NULL DEFAULT now(),
                                CONSTRAINT routine_pkey PRIMARY KEY (id),
                                CONSTRAINT rutine_creator_fkey FOREIGN KEY (creator) REFERENCES public.profile(id)
);
CREATE TABLE public.set_template (
                                     id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                     order bigint NOT NULL,
                                     reps character varying NOT NULL,
                                     kg character varying,
                                     type character varying NOT NULL,
                                     CONSTRAINT set_template_pkey PRIMARY KEY (id)
);
CREATE TABLE public.routine_has_exercise_template (
                                                      id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                                      routine bigint NOT NULL,
                                                      exercise_template bigint NOT NULL,
                                                      position integer NOT NULL DEFAULT 1,
                                                      CONSTRAINT routine_has_exercise_template_pkey PRIMARY KEY (id),
                                                      CONSTRAINT rutine_has_exercise_template_rutine_fkey FOREIGN KEY (routine) REFERENCES public.routine(id),
                                                      CONSTRAINT rutine_has_exercise_template_exercise_template_fkey FOREIGN KEY (exercise_template) REFERENCES public.exercise_template(id)
);
CREATE TABLE public.exercise_template_has_set_template (
                                                           id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                                           exercise_template bigint NOT NULL,
                                                           set_template bigint NOT NULL,
                                                           CONSTRAINT exercise_template_has_set_template_pkey PRIMARY KEY (id),
                                                           CONSTRAINT exercise_template_has_set_template_exercise_template_fkey FOREIGN KEY (exercise_template) REFERENCES public.exercise_template(id),
                                                           CONSTRAINT exercise_template_has_set_template_set_template_fkey FOREIGN KEY (set_template) REFERENCES public.set_template(id)
);
CREATE TABLE public.profile_has_routine (
                                            id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                            profile bigint,
                                            routine bigint,
                                            CONSTRAINT profile_has_routine_pkey PRIMARY KEY (id),
                                            CONSTRAINT profile_has_routine_profile_fkey FOREIGN KEY (profile) REFERENCES public.profile(id),
                                            CONSTRAINT profile_has_routine_routine_fkey FOREIGN KEY (routine) REFERENCES public.routine(id)
);
CREATE TABLE public.tag (
                            id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                            name character varying NOT NULL UNIQUE,
                            category character varying,
                            CONSTRAINT tag_pkey PRIMARY KEY (id)
);
CREATE TABLE public.exercise_template_has_tag (
                                                  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                                  exercise_template bigint NOT NULL,
                                                  tag bigint NOT NULL,
                                                  CONSTRAINT exercise_template_has_tag_pkey PRIMARY KEY (id),
                                                  CONSTRAINT exercise_template_has_tag_exercise_template_fkey FOREIGN KEY (exercise_template) REFERENCES public.exercise_template(id),
                                                  CONSTRAINT exercise_template_has_tag_tag_fkey FOREIGN KEY (tag) REFERENCES public.tag(id)
);
CREATE TABLE public.training_session (
                                         id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                         created_at timestamp with time zone NOT NULL DEFAULT now(),
                                         profile_id bigint NOT NULL,
                                         routine_id bigint NOT NULL,
                                         started_at timestamp with time zone NOT NULL DEFAULT now(),
                                         ended_at timestamp with time zone,
                                         completed boolean NOT NULL DEFAULT false,
                                         status character varying NOT NULL DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'completed'::character varying, 'cancelled'::character varying]::text[])),
                                         feeling character varying,
                                         notes text,
                                         CONSTRAINT training_session_pkey PRIMARY KEY (id),
                                         CONSTRAINT training_session_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id),
                                         CONSTRAINT training_session_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.routine(id)
);
CREATE TABLE public.completed_exercise (
                                           id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                           session_id bigint NOT NULL,
                                           exercise_template_id bigint NOT NULL,
                                           exercise_order integer NOT NULL,
                                           completed boolean NOT NULL DEFAULT false,
                                           completed_at timestamp with time zone,
                                           rpe integer,
                                           CONSTRAINT completed_exercise_pkey PRIMARY KEY (id),
                                           CONSTRAINT completed_exercise_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.training_session(id),
                                           CONSTRAINT completed_exercise_exercise_template_id_fkey FOREIGN KEY (exercise_template_id) REFERENCES public.exercise_template(id)
);
CREATE TABLE public.completed_set (
                                      id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                      completed_exercise_id bigint NOT NULL,
                                      set_order integer NOT NULL,
                                      reps_completed integer,
                                      kg_used double precision,
                                      type character varying NOT NULL,
                                      CONSTRAINT completed_set_pkey PRIMARY KEY (id),
                                      CONSTRAINT completed_set_completed_exercise_id_fkey FOREIGN KEY (completed_exercise_id) REFERENCES public.completed_exercise(id)
);
CREATE TABLE public.food (
                             id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                             created_at timestamp with time zone DEFAULT now(),
                             name character varying NOT NULL,
                             brand character varying,
                             calories double precision,
                             protein double precision,
                             carbs double precision,
                             fat double precision,
                             fiber double precision,
                             serving_size character varying,
                             created_by bigint NOT NULL,
                             CONSTRAINT food_pkey PRIMARY KEY (id),
                             CONSTRAINT food_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profile(id)
);
CREATE TABLE public.food_has_tag (
                                     id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                     food_id bigint NOT NULL,
                                     tag_id bigint NOT NULL,
                                     CONSTRAINT food_has_tag_pkey PRIMARY KEY (id),
                                     CONSTRAINT food_has_tag_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.food(id),
                                     CONSTRAINT food_has_tag_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tag(id)
);
CREATE TABLE public.recipe (
                               id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                               created_at timestamp with time zone DEFAULT now(),
                               name character varying NOT NULL,
                               description text,
                               instructions text,
                               preparation_time integer,
                               servings integer NOT NULL DEFAULT 1,
                               created_by bigint NOT NULL,
                               CONSTRAINT recipe_pkey PRIMARY KEY (id),
                               CONSTRAINT recipe_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profile(id)
);
CREATE TABLE public.recipe_food (
                                    id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                    recipe_id bigint NOT NULL,
                                    food_id bigint NOT NULL,
                                    quantity_g double precision NOT NULL,
                                    notes character varying,
                                    CONSTRAINT recipe_food_pkey PRIMARY KEY (id),
                                    CONSTRAINT recipe_food_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipe(id),
                                    CONSTRAINT recipe_food_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.food(id)
);
CREATE TABLE public.recipe_has_tag (
                                       id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                       recipe_id bigint NOT NULL,
                                       tag_id bigint NOT NULL,
                                       CONSTRAINT recipe_has_tag_pkey PRIMARY KEY (id),
                                       CONSTRAINT recipe_has_tag_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipe(id),
                                       CONSTRAINT recipe_has_tag_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tag(id)
);
CREATE TABLE public.meal_plan (
                                  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                  created_at timestamp with time zone DEFAULT now(),
                                  title character varying NOT NULL,
                                  description text,
                                  target_calories double precision,
                                  target_protein double precision,
                                  target_carbs double precision,
                                  target_fat double precision,
                                  created_by bigint NOT NULL,
                                  CONSTRAINT meal_plan_pkey PRIMARY KEY (id),
                                  CONSTRAINT meal_plan_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profile(id)
);
CREATE TABLE public.profile_has_meal_plan (
                                              id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                              profile_id bigint NOT NULL,
                                              meal_plan_id bigint NOT NULL,
                                              CONSTRAINT profile_has_meal_plan_pkey PRIMARY KEY (id),
                                              CONSTRAINT profile_has_meal_plan_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id),
                                              CONSTRAINT profile_has_meal_plan_meal_plan_id_fkey FOREIGN KEY (meal_plan_id) REFERENCES public.meal_plan(id)
);
CREATE TABLE public.meal_plan_day (
                                      id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                      meal_plan_id bigint NOT NULL,
                                      day_order integer NOT NULL,
                                      label character varying,
                                      CONSTRAINT meal_plan_day_pkey PRIMARY KEY (id),
                                      CONSTRAINT meal_plan_day_meal_plan_id_fkey FOREIGN KEY (meal_plan_id) REFERENCES public.meal_plan(id)
);
CREATE TABLE public.meal_plan_slot (
                                       id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                       day_id bigint NOT NULL,
                                       slot_order integer NOT NULL,
                                       label character varying NOT NULL,
                                       CONSTRAINT meal_plan_slot_pkey PRIMARY KEY (id),
                                       CONSTRAINT meal_plan_slot_day_id_fkey FOREIGN KEY (day_id) REFERENCES public.meal_plan_day(id)
);
CREATE TABLE public.meal_plan_item (
                                       id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                       slot_id bigint NOT NULL,
                                       item_order integer NOT NULL,
                                       recipe_id bigint,
                                       food_id bigint,
                                       quantity_g double precision,
                                       servings double precision,
                                       notes character varying,
                                       CONSTRAINT meal_plan_item_pkey PRIMARY KEY (id),
                                       CONSTRAINT meal_plan_item_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.meal_plan_slot(id),
                                       CONSTRAINT meal_plan_item_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipe(id),
                                       CONSTRAINT meal_plan_item_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.food(id)
);
-- Módulo de eventos / calendario.
--
-- `calendar_event` es el evento "maestro": almacena la regla de recurrencia
-- (RFC 5545 RRULE) o, si `freq` es NULL, un evento único. Los eventos fijos
-- del sistema (mediciones semanales el lunes y check-in el domingo) no se
-- persisten: se generan en el cliente.
--
-- `calendar_event_exception` modela EXDATE (status 'cancelled') y los
-- overrides RECURRENCE-ID (status 'modified') por ocurrencia concreta.
CREATE TABLE public.calendar_event (
                                       id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                       profile_id bigint NOT NULL,
                                       created_by bigint NOT NULL,
                                       event_type text NOT NULL,
                                       title text NOT NULL,
                                       description text,
                                       dtstart date NOT NULL,
                                       start_time time without time zone,
                                       freq text,
                                       recurrence_interval smallint NOT NULL DEFAULT 1,
                                       byday smallint,
                                       bymonthday smallint,
                                       bymonth smallint,
                                       count integer,
                                       until date,
                                       routine_id bigint,
                                       active boolean NOT NULL DEFAULT true,
                                       created_at timestamp with time zone NOT NULL DEFAULT now(),
                                       CONSTRAINT calendar_event_pkey PRIMARY KEY (id),
                                       CONSTRAINT calendar_event_event_type_check CHECK (event_type = ANY (ARRAY['training'::text, 'info'::text, 'photos'::text])),
                                       CONSTRAINT calendar_event_freq_check CHECK (freq IS NULL OR freq = ANY (ARRAY['once'::text, 'weekly'::text, 'monthly'::text, 'yearly'::text])),
                                       CONSTRAINT calendar_event_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profile(id),
                                       CONSTRAINT calendar_event_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profile(id),
                                       CONSTRAINT calendar_event_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.routine(id)
);
CREATE TABLE public.calendar_event_exception (
                                                 id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
                                                 event_id bigint NOT NULL,
                                                 recurrence_id date NOT NULL,
                                                 status text NOT NULL,
                                                 new_date date,
                                                 new_start_time time without time zone,
                                                 title text,
                                                 description text,
                                                 created_at timestamp with time zone NOT NULL DEFAULT now(),
                                                 CONSTRAINT calendar_event_exception_pkey PRIMARY KEY (id),
                                                 CONSTRAINT calendar_event_exception_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.calendar_event(id),
                                                 CONSTRAINT calendar_event_exception_event_id_recurrence_id_key UNIQUE (event_id, recurrence_id),
                                                 CONSTRAINT calendar_event_exception_status_check CHECK (status = ANY (ARRAY['cancelled'::text, 'modified'::text]))
);
-- Parte una serie recurrente en dos ("editar esta y las siguientes").
-- Corta el maestro original con `until` justo antes de `p_from_date` y crea un
-- maestro nuevo a partir de esa fecha con los valores indicados. De forma
-- atómica (una sola transacción).
CREATE OR REPLACE FUNCTION public.split_calendar_event(
    p_event_id bigint,
    p_from_date date,
    p_title text,
    p_description text,
    p_start_time time without time zone,
    p_freq text,
    p_interval smallint,
    p_byday smallint,
    p_bymonthday smallint,
    p_bymonth smallint,
    p_count integer,
    p_until date,
    p_routine_id bigint
)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_original public.calendar_event%ROWTYPE;
    v_new_id bigint;
BEGIN
    SELECT * INTO v_original FROM public.calendar_event WHERE id = p_event_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Evento no encontrado';
    END IF;

    UPDATE public.calendar_event
       SET until = p_from_date - 1
     WHERE id = p_event_id;

    INSERT INTO public.calendar_event (
        profile_id, created_by, event_type, title, description,
        dtstart, start_time, freq, recurrence_interval, byday, bymonthday, bymonth,
        count, until, routine_id, active
    )
    VALUES (
        v_original.profile_id,
        v_original.created_by,
        v_original.event_type,
        p_title,
        p_description,
        p_from_date,
        p_start_time,
        p_freq,
        p_interval,
        p_byday,
        p_bymonthday,
        p_bymonth,
        p_count,
        p_until,
        p_routine_id,
        true
    )
    RETURNING id INTO v_new_id;

    RETURN v_new_id;
END;
$function$;
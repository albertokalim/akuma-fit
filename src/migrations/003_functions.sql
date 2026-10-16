-- 003: funciones. Deben crearse antes de las políticas RLS que las usan.

-- Id del perfil del usuario autenticado.
CREATE OR REPLACE FUNCTION public.get_profile_id()
 RETURNS bigint
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
    SELECT id FROM public.profile WHERE user_id = auth.uid();
$function$;

-- Indica si el usuario autenticado tiene rol coach.
CREATE OR REPLACE FUNCTION public.is_coach()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
    SELECT EXISTS (
        SELECT 1 FROM public.profile
        WHERE user_id = auth.uid() AND role = 'coach'
    );
$function$;

-- Últimos N check-ins de cada perfil indicado.
CREATE OR REPLACE FUNCTION public.get_recent_checkins_per_profile(p_profile_ids bigint[], p_limit_per_profile integer DEFAULT 3)
 RETURNS SETOF check_in
 LANGUAGE sql
 STABLE
AS $function$
    SELECT
        ci.id,
        ci.created_at,
        ci.how_do_you_feel,
        ci.hunger_level,
        ci.rest_quality,
        ci.comments,
        ci.profile_id,
        ci.diet_adherence,
        ci.training_adherence,
        ci.diet_adherence_reason,
        ci.training_adherence_reason,
        ci.gym_performance,
        ci.avg_daily_steps,
        ci.cardio_adherence,
        ci.avg_sleep_hours,
        ci.energy_level,
        ci.next_week_goal
    FROM (
        SELECT
            c.*,
            ROW_NUMBER() OVER (
                PARTITION BY c.profile_id
                ORDER BY c.created_at DESC
            ) AS rn
        FROM public.check_in c
        WHERE c.profile_id = ANY(p_profile_ids)
    ) ci
    WHERE ci.rn <= p_limit_per_profile;
$function$;

-- Parte una serie recurrente en dos ("editar esta y las siguientes").
-- Corta el maestro original con `until` justo antes de `p_from_date` y crea un
-- maestro nuevo a partir de esa fecha con los valores indicados, de forma
-- atómica (una sola transacción).
CREATE OR REPLACE FUNCTION public.split_calendar_event(p_event_id bigint, p_from_date date, p_title text, p_description text, p_start_time time without time zone, p_freq text, p_interval smallint, p_byday smallint, p_bymonthday smallint, p_bymonth smallint, p_count integer, p_until date, p_routine_id bigint)
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

-- Crea una sesión de entrenamiento y precarga sus ejercicios desde la rutina.
CREATE OR REPLACE FUNCTION public.create_training_session(p_profile_id bigint, p_routine_id bigint)
 RETURNS training_session
 LANGUAGE plpgsql
AS $function$
declare
    v_session training_session;
begin
    insert into training_session (profile_id, routine_id, started_at, status)
    values (p_profile_id, p_routine_id, now(), 'active')
    returning * into v_session;

    insert into completed_exercise (session_id, exercise_template_id, exercise_order, completed)
    select
        v_session.id,
        rhe.exercise_template,
        row_number() over (order by rhe.position),
        false
    from routine_has_exercise_template rhe
    where rhe.routine = p_routine_id;

    return v_session;
end;
$function$;

-- Función auxiliar de Supabase que habilita RLS automáticamente en tablas
-- nuevas de `public`. El event trigger que la usa no está incluido en el
-- volcado de triggers; es opcional porque 004 ya activa RLS explícitamente
-- en todas las tablas. Descomenta si quieres replicar ese comportamiento.
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

-- CREATE EVENT TRIGGER rls_auto_enable ON ddl_command_end
--   WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
--   EXECUTE FUNCTION public.rls_auto_enable();

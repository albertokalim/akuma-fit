-- 005: buckets de Storage y sus políticas sobre storage.objects.
-- Todos los buckets son privados; el acceso se rige por las políticas.
-- En los buckets con carpeta por perfil, el primer segmento de la ruta es el
-- id del perfil (`<profile_id>/<archivo>`).

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('avatars', 'avatars', false, 5242880, NULL),
    ('body-photos', 'body-photos', false, NULL, NULL),
    ('exercise-video', 'exercise-video', false, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- avatars
CREATE POLICY "avatars_select_public" ON storage.objects AS PERMISSIVE FOR SELECT TO public
    USING (bucket_id = 'avatars'::text);
CREATE POLICY "avatars_insert_own" ON storage.objects AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'avatars'::text
        AND (storage.foldername(name))[1] IN (
            SELECT (profile.id)::text AS id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "avatars_update_own" ON storage.objects AS PERMISSIVE FOR UPDATE TO authenticated
    USING (
        bucket_id = 'avatars'::text
        AND (storage.foldername(name))[1] IN (
            SELECT (profile.id)::text AS id FROM profile WHERE profile.user_id = auth.uid()))
    WITH CHECK (
        bucket_id = 'avatars'::text
        AND (storage.foldername(name))[1] IN (
            SELECT (profile.id)::text AS id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "avatars_delete_own" ON storage.objects AS PERMISSIVE FOR DELETE TO authenticated
    USING (
        bucket_id = 'avatars'::text
        AND (storage.foldername(name))[1] IN (
            SELECT (profile.id)::text AS id FROM profile WHERE profile.user_id = auth.uid()));

-- body-photos
CREATE POLICY "body-photos: select - public access" ON storage.objects AS PERMISSIVE FOR SELECT TO public
    USING (bucket_id = 'body-photos'::text);
CREATE POLICY "body-photos: insert - own profile only" ON storage.objects AS PERMISSIVE FOR INSERT TO public
    WITH CHECK (
        bucket_id = 'body-photos'::text
        AND (storage.foldername(name))[1] = (
            SELECT (profile.id)::text AS id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "body-photos: update - own profile only" ON storage.objects AS PERMISSIVE FOR UPDATE TO public
    USING (
        bucket_id = 'body-photos'::text
        AND (storage.foldername(name))[1] = (
            SELECT (profile.id)::text AS id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "body-photos: delete - own profile only" ON storage.objects AS PERMISSIVE FOR DELETE TO public
    USING (
        bucket_id = 'body-photos'::text
        AND (storage.foldername(name))[1] = (
            SELECT (profile.id)::text AS id FROM profile WHERE profile.user_id = auth.uid()));

-- exercise-video
CREATE POLICY "exercise-video: select - public access" ON storage.objects AS PERMISSIVE FOR SELECT TO public
    USING (bucket_id = 'exercise-video'::text);
CREATE POLICY "exercise_video_select_authenticated" ON storage.objects AS PERMISSIVE FOR SELECT TO authenticated
    USING (bucket_id = 'exercise-video'::text);
CREATE POLICY "exercise-video: insert - own profile only" ON storage.objects AS PERMISSIVE FOR INSERT TO public
    WITH CHECK (
        bucket_id = 'exercise-video'::text
        AND (storage.foldername(name))[1] = (
            SELECT (profile.id)::text AS id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "exercise-video: update - own profile only" ON storage.objects AS PERMISSIVE FOR UPDATE TO public
    USING (
        bucket_id = 'exercise-video'::text
        AND (storage.foldername(name))[1] = (
            SELECT (profile.id)::text AS id FROM profile WHERE profile.user_id = auth.uid()));
CREATE POLICY "exercise-video: delete - own profile only" ON storage.objects AS PERMISSIVE FOR DELETE TO public
    USING (
        bucket_id = 'exercise-video'::text
        AND (storage.foldername(name))[1] = (
            SELECT (profile.id)::text AS id FROM profile WHERE profile.user_id = auth.uid()));

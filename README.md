Akuma Fit

Una app con React + Vite y Supabase. Hecha para entrenadores personales.

## Puesta en marcha

1. `npm install`
2. Copia `.env.example` a `.env.local` (en la raíz) y rellena las variables con los datos de tu proyecto Supabase (`.env.local` está en el repo con los valores vacíos):
   ```
   VITE_SUPABASE_URL=https://<project-id>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<publishable key>
   ```
3. En una base de datos vacía, ejecuta en el SQL Editor de Supabase, por orden, los archivos de `src/migrations/`:
   `001_types.sql`, `002_tables.sql`, `003_functions.sql`, `004_rls_policies.sql`, `005_storage.sql` y `006_constraints_indexes.sql`
   (tipos, tablas, funciones, RLS/políticas y buckets de Storage).
4. `npm run dev`

## Nota para el siguiente desarrollador

- **La app no está completa.** Algunas funciones necesitan ser revisadas y probadas antes de considerarlas estables.
- **Hace falta hosting para desplegarla.** El proyecto es una SPA (Vite); para publicarla necesitarás un servicio que la hostee (Vercel, Netlify, Cloudflare Pages, etc.) con `npm run build` y las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` configuradas. Además, un proyecto Supabase propio (el original será eliminado).

Esta app también es un medio para experimentar con OpenCode y el uso de IA en el desarrollo. El código de la app está parcialmente escrito por mí, pero he usado los agentes de modo que sigan mis instrucciones para picar el código más pesado y para que me ayuden a tomar varias decisiones. He usado DeepSeek V4 Pro, Qwen 3.7, GLM 5.2 y Claude Sonnet para apoyarme en el desarrollo.
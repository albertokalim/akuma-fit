-- 001: tipos enumerados.

CREATE TYPE public.adherence AS ENUM ('Totalmente', 'Parcialmente', 'Nada');
CREATE TYPE public.gender AS ENUM ('Hombre', 'Mujer', 'Prefiero no decirlo');
CREATE TYPE public.role AS ENUM ('admin', 'coach', 'client');

-- LifeOS: registro della identità canonica e delle associazioni applicative.
-- Schema effettivamente applicato su Supabase il 13-10-2026.
-- Eseguire UNA sola volta in un progetto che dispone già di auth.users.
-- Non contiene credenziali o dati personali.
--
-- LifeOS è il sistema completo. Life Tracker 3.1 e Journal rimangono
-- moduli separati con i loro percorsi/tabelle legacy per compatibilità.

CREATE TABLE public.lifeos_system_registry (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    canonical_name text NOT NULL DEFAULT 'LifeOS'
        CHECK (canonical_name = 'LifeOS'),
    aliases text[] NOT NULL DEFAULT ARRAY['Life OS', 'Sistema LifeOS']::text[],
    description text NOT NULL DEFAULT '',
    components jsonb NOT NULL DEFAULT '{}'::jsonb
        CHECK (jsonb_typeof(components) = 'object'),
    repository text NOT NULL DEFAULT 'miemail1234-boop/Codici1',
    documentation_path text NOT NULL DEFAULT 'README.md',
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lifeos_system_registry ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.lifeos_system_registry FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
    ON public.lifeos_system_registry TO authenticated;

CREATE POLICY lifeos_registry_select_own
    ON public.lifeos_system_registry FOR SELECT TO authenticated
    USING ((SELECT auth.uid()) = user_id);
CREATE POLICY lifeos_registry_insert_own
    ON public.lifeos_system_registry FOR INSERT TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY lifeos_registry_update_own
    ON public.lifeos_system_registry FOR UPDATE TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY lifeos_registry_delete_own
    ON public.lifeos_system_registry FOR DELETE TO authenticated
    USING ((SELECT auth.uid()) = user_id);

-- La riga operativa è stata creata e popolata sul progetto effettivo.
-- Per riutilizzare lo schema con altro account, creare una riga
-- user_id = auth.uid(), canonical_name = 'LifeOS' dal client autenticato
-- oppure fare onboarding server-side da una riga Journal esistente.
-- La mappa components (jsonb) e le istruzioni per ChatGPT sono in Supabase,
-- mentre README.md è la documentazione verificabile del progetto.

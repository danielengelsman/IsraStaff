-- ============================================
-- Office Rota Tables
-- ============================================

-- Default weekly pattern (one row per employee per weekday)
CREATE TABLE public.rota_defaults (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week   SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 4),
  location      TEXT NOT NULL DEFAULT 'office' CHECK (location IN ('office', 'home')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, day_of_week)
);

-- Day-specific overrides (takes precedence over defaults for that date)
CREATE TABLE public.rota_overrides (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  location      TEXT NOT NULL CHECK (location IN ('office', 'home')),
  created_by    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, date)
);

-- Indexes
CREATE INDEX idx_rota_defaults_profile ON rota_defaults(profile_id);
CREATE INDEX idx_rota_overrides_profile ON rota_overrides(profile_id);
CREATE INDEX idx_rota_overrides_date ON rota_overrides(date);
CREATE INDEX idx_rota_overrides_profile_date ON rota_overrides(profile_id, date);

-- Auto-update timestamps (reuses existing update_updated_at function from 002)
CREATE TRIGGER set_updated_at_rota_defaults
  BEFORE UPDATE ON rota_defaults
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_rota_overrides
  BEFORE UPDATE ON rota_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE public.rota_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rota_overrides ENABLE ROW LEVEL SECURITY;

-- SELECT: Everyone can read all rota data (needed for "who's in office" widget)
CREATE POLICY rota_defaults_select ON rota_defaults
  FOR SELECT USING (true);

CREATE POLICY rota_overrides_select ON rota_overrides
  FOR SELECT USING (true);

-- INSERT on rota_defaults: managers for their department, admins for anyone
CREATE POLICY rota_defaults_insert ON rota_defaults
  FOR INSERT WITH CHECK (
    (
      get_user_role() = 'manager'
      AND EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = rota_defaults.profile_id
        AND is_department_manager(p.department_id)
      )
    )
    OR get_user_role() = 'admin'
  );

CREATE POLICY rota_defaults_update ON rota_defaults
  FOR UPDATE USING (
    (
      get_user_role() = 'manager'
      AND EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = rota_defaults.profile_id
        AND is_department_manager(p.department_id)
      )
    )
    OR get_user_role() = 'admin'
  );

CREATE POLICY rota_defaults_delete ON rota_defaults
  FOR DELETE USING (
    (
      get_user_role() = 'manager'
      AND EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = rota_defaults.profile_id
        AND is_department_manager(p.department_id)
      )
    )
    OR get_user_role() = 'admin'
  );

-- INSERT/UPDATE/DELETE on rota_overrides: same manager/admin pattern
CREATE POLICY rota_overrides_insert ON rota_overrides
  FOR INSERT WITH CHECK (
    (
      get_user_role() = 'manager'
      AND EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = rota_overrides.profile_id
        AND is_department_manager(p.department_id)
      )
    )
    OR get_user_role() = 'admin'
  );

CREATE POLICY rota_overrides_update ON rota_overrides
  FOR UPDATE USING (
    (
      get_user_role() = 'manager'
      AND EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = rota_overrides.profile_id
        AND is_department_manager(p.department_id)
      )
    )
    OR get_user_role() = 'admin'
  );

CREATE POLICY rota_overrides_delete ON rota_overrides
  FOR DELETE USING (
    (
      get_user_role() = 'manager'
      AND EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = rota_overrides.profile_id
        AND is_department_manager(p.department_id)
      )
    )
    OR get_user_role() = 'admin'
  );

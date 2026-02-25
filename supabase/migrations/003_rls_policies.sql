-- ============================================
-- Row Level Security Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacation_allowances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES
-- ============================================
-- Everyone can see profiles in their department + admins see all
CREATE POLICY profiles_select ON profiles FOR SELECT USING (
  auth.uid() = id
  OR department_id = get_user_department()
  OR get_user_role() IN ('manager', 'admin')
);

-- Users can update their own profile (name, avatar)
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (
  auth.uid() = id
) WITH CHECK (
  auth.uid() = id
);

-- Admins can update any profile (role, department)
CREATE POLICY profiles_update_admin ON profiles FOR UPDATE USING (
  get_user_role() = 'admin'
) WITH CHECK (
  get_user_role() = 'admin'
);

-- ============================================
-- DEPARTMENTS
-- ============================================
-- All authenticated users can read departments
CREATE POLICY departments_select ON departments FOR SELECT USING (true);

-- Only admins can manage departments
CREATE POLICY departments_insert ON departments FOR INSERT WITH CHECK (
  get_user_role() = 'admin'
);
CREATE POLICY departments_update ON departments FOR UPDATE USING (
  get_user_role() = 'admin'
);
CREATE POLICY departments_delete ON departments FOR DELETE USING (
  get_user_role() = 'admin'
);

-- ============================================
-- VACATION ALLOWANCES
-- ============================================
-- Users see own, managers see department, admins see all
CREATE POLICY allowances_select ON vacation_allowances FOR SELECT USING (
  auth.uid() = profile_id
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = vacation_allowances.profile_id
    AND p.department_id = get_user_department()
    AND get_user_role() = 'manager'
  )
  OR get_user_role() = 'admin'
);

-- Only admins manage allowances
CREATE POLICY allowances_insert ON vacation_allowances FOR INSERT WITH CHECK (
  get_user_role() = 'admin'
);
CREATE POLICY allowances_update ON vacation_allowances FOR UPDATE USING (
  get_user_role() = 'admin'
);
CREATE POLICY allowances_delete ON vacation_allowances FOR DELETE USING (
  get_user_role() = 'admin'
);

-- ============================================
-- VACATION REQUESTS
-- ============================================
-- Users see own, same department sees approved (for calendar), managers/admins see department/all
CREATE POLICY requests_select ON vacation_requests FOR SELECT USING (
  auth.uid() = profile_id
  OR (
    status = 'approved'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = vacation_requests.profile_id
      AND p.department_id = get_user_department()
    )
  )
  OR (
    get_user_role() = 'manager'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = vacation_requests.profile_id
      AND is_department_manager(p.department_id)
    )
  )
  OR get_user_role() = 'admin'
);

-- Employees create their own requests
CREATE POLICY requests_insert ON vacation_requests FOR INSERT WITH CHECK (
  auth.uid() = profile_id
);

-- Owner can cancel pending, manager/admin can approve/reject
CREATE POLICY requests_update ON vacation_requests FOR UPDATE USING (
  (auth.uid() = profile_id)
  OR (
    get_user_role() = 'manager'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = vacation_requests.profile_id
      AND is_department_manager(p.department_id)
    )
  )
  OR get_user_role() = 'admin'
);

-- ============================================
-- BUSINESS TRIPS
-- ============================================
CREATE POLICY trips_select ON business_trips FOR SELECT USING (
  auth.uid() = profile_id
  OR (
    get_user_role() = 'manager'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = business_trips.profile_id
      AND is_department_manager(p.department_id)
    )
  )
  OR get_user_role() = 'admin'
);

CREATE POLICY trips_insert ON business_trips FOR INSERT WITH CHECK (
  auth.uid() = profile_id
);

CREATE POLICY trips_update ON business_trips FOR UPDATE USING (
  (auth.uid() = profile_id AND status IN ('planned'))
  OR (
    get_user_role() = 'manager'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = business_trips.profile_id
      AND is_department_manager(p.department_id)
    )
  )
  OR get_user_role() = 'admin'
);

CREATE POLICY trips_delete ON business_trips FOR DELETE USING (
  (auth.uid() = profile_id AND status = 'planned')
  OR get_user_role() = 'admin'
);

-- ============================================
-- TRIP EVENTS
-- ============================================
CREATE POLICY trip_events_select ON trip_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM business_trips t
    WHERE t.id = trip_events.trip_id
    AND (
      t.profile_id = auth.uid()
      OR get_user_role() = 'admin'
      OR (
        get_user_role() = 'manager'
        AND EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = t.profile_id
          AND is_department_manager(p.department_id)
        )
      )
    )
  )
);

CREATE POLICY trip_events_insert ON trip_events FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM business_trips t
    WHERE t.id = trip_events.trip_id
    AND t.profile_id = auth.uid()
    AND t.status != 'completed'
  )
);

CREATE POLICY trip_events_update ON trip_events FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM business_trips t
    WHERE t.id = trip_events.trip_id
    AND (t.profile_id = auth.uid() OR get_user_role() = 'admin')
    AND t.status != 'completed'
  )
);

CREATE POLICY trip_events_delete ON trip_events FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM business_trips t
    WHERE t.id = trip_events.trip_id
    AND (t.profile_id = auth.uid() OR get_user_role() = 'admin')
    AND t.status != 'completed'
  )
);

-- ============================================
-- TRIP EXPENSES
-- ============================================
CREATE POLICY trip_expenses_select ON trip_expenses FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM business_trips t
    WHERE t.id = trip_expenses.trip_id
    AND (
      t.profile_id = auth.uid()
      OR get_user_role() = 'admin'
      OR (
        get_user_role() = 'manager'
        AND EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = t.profile_id
          AND is_department_manager(p.department_id)
        )
      )
    )
  )
);

CREATE POLICY trip_expenses_insert ON trip_expenses FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM business_trips t
    WHERE t.id = trip_expenses.trip_id
    AND t.profile_id = auth.uid()
  )
);

CREATE POLICY trip_expenses_update ON trip_expenses FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM business_trips t
    WHERE t.id = trip_expenses.trip_id
    AND (t.profile_id = auth.uid() OR get_user_role() = 'admin')
  )
);

CREATE POLICY trip_expenses_delete ON trip_expenses FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM business_trips t
    WHERE t.id = trip_expenses.trip_id
    AND (t.profile_id = auth.uid() OR get_user_role() = 'admin')
  )
);

-- ============================================
-- HOLIDAYS
-- ============================================
CREATE POLICY holidays_select ON holidays FOR SELECT USING (true);
CREATE POLICY holidays_insert ON holidays FOR INSERT WITH CHECK (get_user_role() = 'admin');
CREATE POLICY holidays_update ON holidays FOR UPDATE USING (get_user_role() = 'admin');
CREATE POLICY holidays_delete ON holidays FOR DELETE USING (get_user_role() = 'admin');

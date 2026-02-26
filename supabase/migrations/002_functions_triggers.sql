-- ============================================
-- Functions and Triggers
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'employee'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get current user's department
CREATE OR REPLACE FUNCTION public.get_user_department()
RETURNS UUID AS $$
  SELECT department_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: check if current user manages a specific department
CREATE OR REPLACE FUNCTION public.is_department_manager(dept_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.departments
    WHERE id = dept_id AND manager_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Auto-update vacation balance when request status changes
CREATE OR REPLACE FUNCTION public.update_vacation_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- On approval: deduct days
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE public.vacation_allowances
    SET
      used_days = used_days + NEW.total_days,
      updated_at = now()
    WHERE profile_id = NEW.profile_id
      AND year = EXTRACT(YEAR FROM NEW.start_date);
  END IF;

  -- On cancellation of approved request: restore days
  IF NEW.status = 'cancelled' AND OLD.status = 'approved' THEN
    UPDATE public.vacation_allowances
    SET
      used_days = GREATEST(used_days - NEW.total_days, 0),
      updated_at = now()
    WHERE profile_id = NEW.profile_id
      AND year = EXTRACT(YEAR FROM NEW.start_date);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vacation_status_change
  AFTER UPDATE OF status ON public.vacation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_vacation_balance();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_departments BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_allowances BEFORE UPDATE ON vacation_allowances FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_requests BEFORE UPDATE ON vacation_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_trips BEFORE UPDATE ON business_trips FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_events BEFORE UPDATE ON trip_events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_expenses BEFORE UPDATE ON trip_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at();

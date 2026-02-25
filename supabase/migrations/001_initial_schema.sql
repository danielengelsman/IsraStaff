-- ============================================
-- IsraStaff Database Schema
-- ============================================

-- Departments
CREATE TABLE public.departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  manager_id  UUID, -- FK added after profiles table
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'admin')),
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Now add the FK from departments.manager_id -> profiles.id
ALTER TABLE public.departments
  ADD CONSTRAINT fk_departments_manager
  FOREIGN KEY (manager_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Vacation Allowances (per employee, per year)
CREATE TABLE public.vacation_allowances (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  year          INTEGER NOT NULL,
  total_days    NUMERIC(5,1) NOT NULL DEFAULT 12,
  used_days     NUMERIC(5,1) NOT NULL DEFAULT 0,
  sick_days     NUMERIC(5,1) NOT NULL DEFAULT 5,
  used_sick     NUMERIC(5,1) NOT NULL DEFAULT 0,
  personal_days NUMERIC(5,1) NOT NULL DEFAULT 3,
  used_personal NUMERIC(5,1) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, year)
);

-- Vacation Requests
CREATE TABLE public.vacation_requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('vacation', 'sick', 'personal')),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  notes         TEXT,
  reviewed_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at   TIMESTAMPTZ,
  review_notes  TEXT,
  total_days    NUMERIC(5,1) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

-- Business Trips
CREATE TABLE public.business_trips (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  destination     TEXT NOT NULL,
  country         TEXT NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  purpose         TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'approved', 'in_progress', 'completed', 'cancelled')),
  approved_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at     TIMESTAMPTZ,
  notes           TEXT,
  total_budget    NUMERIC(12,2),
  currency        TEXT NOT NULL DEFAULT 'USD',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

-- Trip Events (itinerary)
CREATE TABLE public.trip_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID NOT NULL REFERENCES public.business_trips(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  event_type  TEXT NOT NULL CHECK (event_type IN ('meeting', 'conference', 'workshop', 'site_visit', 'travel', 'other')),
  location    TEXT,
  start_time  TIMESTAMPTZ NOT NULL,
  end_time    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trip Expenses
CREATE TABLE public.trip_expenses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id       UUID NOT NULL REFERENCES public.business_trips(id) ON DELETE CASCADE,
  expense_type  TEXT NOT NULL CHECK (expense_type IN ('flights', 'hotel', 'meals', 'transport', 'other')),
  amount        NUMERIC(12,2) NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'USD',
  description   TEXT,
  receipt_url   TEXT,
  expense_date  DATE NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Holidays
CREATE TABLE public.holidays (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  date        DATE NOT NULL UNIQUE,
  country     TEXT NOT NULL DEFAULT 'IL',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_profiles_department ON profiles(department_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_departments_manager ON departments(manager_id);
CREATE INDEX idx_allowances_profile_year ON vacation_allowances(profile_id, year);
CREATE INDEX idx_vacation_requests_profile ON vacation_requests(profile_id);
CREATE INDEX idx_vacation_requests_status ON vacation_requests(status);
CREATE INDEX idx_vacation_requests_dates ON vacation_requests(start_date, end_date);
CREATE INDEX idx_trips_profile ON business_trips(profile_id);
CREATE INDEX idx_trips_status ON business_trips(status);
CREATE INDEX idx_trips_dates ON business_trips(start_date, end_date);
CREATE INDEX idx_trip_events_trip ON trip_events(trip_id);
CREATE INDEX idx_trip_events_time ON trip_events(start_time);
CREATE INDEX idx_trip_expenses_trip ON trip_expenses(trip_id);
CREATE INDEX idx_trip_expenses_type ON trip_expenses(expense_type);
CREATE INDEX idx_holidays_date ON holidays(date);

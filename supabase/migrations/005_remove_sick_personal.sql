-- ============================================
-- Remove sick days and personal days
-- Keep only vacation days
-- ============================================

-- Update any existing sick/personal requests to vacation type
UPDATE public.vacation_requests SET type = 'vacation' WHERE type IN ('sick', 'personal');

-- Drop the old CHECK constraint and add a new one (vacation only)
ALTER TABLE public.vacation_requests DROP CONSTRAINT IF EXISTS vacation_requests_type_check;
ALTER TABLE public.vacation_requests ADD CONSTRAINT vacation_requests_type_check CHECK (type IN ('vacation'));

-- Drop sick/personal columns from vacation_allowances
ALTER TABLE public.vacation_allowances DROP COLUMN IF EXISTS sick_days;
ALTER TABLE public.vacation_allowances DROP COLUMN IF EXISTS used_sick;
ALTER TABLE public.vacation_allowances DROP COLUMN IF EXISTS personal_days;
ALTER TABLE public.vacation_allowances DROP COLUMN IF EXISTS used_personal;

-- Simplify the vacation balance trigger (only vacation type now)
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

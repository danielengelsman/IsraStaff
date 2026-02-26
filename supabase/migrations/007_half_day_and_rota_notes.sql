-- ============================================
-- Half-Day Holidays + Rota Notes
-- ============================================

-- 1. Add period column to vacation_requests for half-day support
ALTER TABLE public.vacation_requests
  ADD COLUMN period TEXT NOT NULL DEFAULT 'full'
  CHECK (period IN ('full', 'morning', 'afternoon'));

-- 2. Add notes column to rota_overrides for daily status notes
ALTER TABLE public.rota_overrides
  ADD COLUMN notes TEXT;

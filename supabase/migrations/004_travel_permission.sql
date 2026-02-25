-- ============================================
-- Add per-user business travel access toggle
-- ============================================

-- Add column (default false — admin grants access per user)
ALTER TABLE public.profiles
  ADD COLUMN can_access_travel BOOLEAN NOT NULL DEFAULT false;

-- Set existing admins to true for consistency
UPDATE public.profiles SET can_access_travel = true WHERE role = 'admin';

-- Update the handle_new_user trigger to include the new field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, can_access_travel)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'employee',
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

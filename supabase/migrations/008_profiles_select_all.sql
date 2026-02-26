-- Allow all authenticated users to see all profiles.
-- Previously employees could only see profiles in their own department,
-- which prevented them from seeing the full company rota.
DROP POLICY profiles_select ON profiles;

CREATE POLICY profiles_select ON profiles FOR SELECT USING (true);

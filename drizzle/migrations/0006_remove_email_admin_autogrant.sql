DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
DROP TRIGGER IF EXISTS grant_confirmed_staff_admin ON auth.users;
CREATE OR REPLACE FUNCTION public.grant_staff_admin() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Disabled: admin roles are granted only explicitly by an existing admin, never from a claimed email.
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.grant_staff_admin() FROM PUBLIC, anon, authenticated;
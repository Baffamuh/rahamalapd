CREATE OR REPLACE FUNCTION public.grant_staff_admin() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF lower(NEW.email) IN ('rahamalapd@gmail.com','baffahmuhammad0@gmail.com') THEN
  INSERT INTO public.user_roles(user_id,role) VALUES (NEW.id,'admin') ON CONFLICT DO NOTHING;
 END IF;
 RETURN NEW;
END $$;
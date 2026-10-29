CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text NOT NULL DEFAULT '',
 avatar_url text NOT NULL DEFAULT '',
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE FUNCTION public.create_staff_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.profiles(id, display_name) VALUES (NEW.id, coalesce(NEW.raw_user_meta_data->>'display_name','')) ON CONFLICT DO NOTHING;
 RETURN NEW;
END $$;
CREATE TRIGGER create_staff_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_staff_profile();
INSERT INTO public.profiles(id,display_name) SELECT id, coalesce(raw_user_meta_data->>'display_name','') FROM auth.users ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION public.grant_staff_admin() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF NEW.email_confirmed_at IS NOT NULL AND lower(NEW.email) IN ('admin@rahamaproperty.ng', 'rahmalapd@gmail.com') THEN
  INSERT INTO public.user_roles(user_id,role) VALUES (NEW.id,'admin') ON CONFLICT DO NOTHING;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER grant_confirmed_staff_admin AFTER UPDATE OF email_confirmed_at ON auth.users FOR EACH ROW EXECUTE FUNCTION public.grant_staff_admin();
CREATE UNIQUE INDEX properties_unique_slug ON public.properties ((data->>'slug'));
CREATE UNIQUE INDEX properties_unique_ref ON public.properties ((data->>'ref'));
CREATE UNIQUE INDEX sales_unique_receipt ON public.sales ((data->>'receiptNo'));
CREATE UNIQUE INDEX agents_unique_code ON public.agents ((data->>'code'));
CREATE FUNCTION public.apply_staff_changes(_changes jsonb) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE c jsonb; t text; row_id text; current_data jsonb; row_data jsonb; code text; seq integer; yr text;
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Staff access required'; END IF;
 PERFORM pg_advisory_xact_lock(9871926);
 FOR c IN SELECT value FROM jsonb_array_elements(_changes) LOOP
  t := c->>'table'; row_id := c->>'id';
  IF t NOT IN ('zones','properties','agents','sales','enquiries','activity') OR row_id IS NULL THEN RAISE EXCEPTION 'Invalid change'; END IF;
  EXECUTE format('SELECT data FROM public.%I WHERE id=$1 FOR UPDATE',t) INTO current_data USING row_id;
  IF current_data IS DISTINCT FROM nullif(c->'before','null'::jsonb) THEN RAISE EXCEPTION 'This record changed on another device. Refresh and try again.'; END IF;
  row_data := nullif(c->'after','null'::jsonb);
  IF row_data IS NULL THEN
   EXECUTE format('DELETE FROM public.%I WHERE id=$1',t) USING row_id;
  ELSE
   IF row_data->>'id' IS DISTINCT FROM row_id THEN RAISE EXCEPTION 'Record ID mismatch'; END IF;
   IF t='properties' AND current_data IS NULL THEN
    SELECT data->>'code' INTO code FROM public.zones WHERE id=row_data->>'zoneId';
    IF code NOT IN ('AZR','BAU') OR code IS NULL THEN RAISE EXCEPTION 'Select a valid zone'; END IF;
    SELECT coalesce(max(substring(data->>'ref' from '[0-9]+$')::integer),0)+1 INTO seq FROM public.properties WHERE data->>'ref' LIKE 'RHM-'||code||'-%';
    row_data := jsonb_set(row_data,'{ref}',to_jsonb('RHM-'||code||'-'||lpad(seq::text,3,'0')));
    row_data := jsonb_set(row_data,'{slug}',to_jsonb(regexp_replace(lower(row_data->>'title'),'[^a-z0-9]+','-','g')||'-'||row_id));
   ELSIF t='sales' AND current_data IS NULL THEN
    yr := substring(row_data->>'date' from 1 for 4);
    IF yr !~ '^[0-9]{4}$' THEN RAISE EXCEPTION 'Invalid sale date'; END IF;
    IF EXISTS (SELECT 1 FROM public.sales WHERE data->>'propertyId'=row_data->>'propertyId') THEN RAISE EXCEPTION 'A sale already exists for this property'; END IF;
    SELECT coalesce(max(substring(data->>'receiptNo' from '[0-9]+$')::integer),0)+1 INTO seq FROM public.sales WHERE data->>'receiptNo' LIKE 'RHM-RCP-'||yr||'-%';
    row_data := jsonb_set(row_data,'{receiptNo}',to_jsonb('RHM-RCP-'||yr||'-'||lpad(seq::text,4,'0')));
   ELSIF t='agents' AND current_data IS NULL THEN
    SELECT coalesce(max(substring(data->>'code' from '[0-9]+$')::integer),0)+1 INTO seq FROM public.agents;
    row_data := jsonb_set(row_data,'{code}',to_jsonb('RHM-AGT-'||lpad(seq::text,3,'0')));
   END IF;
   EXECUTE format('INSERT INTO public.%I(id,data) VALUES($1,$2) ON CONFLICT(id) DO UPDATE SET data=EXCLUDED.data',t) USING row_id,row_data;
  END IF;
 END LOOP;
END $$;
REVOKE ALL ON FUNCTION public.apply_staff_changes(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_staff_changes(jsonb) TO authenticated;
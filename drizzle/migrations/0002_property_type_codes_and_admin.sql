CREATE OR REPLACE FUNCTION public.grant_staff_admin()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
 IF NEW.email_confirmed_at IS NOT NULL AND lower(NEW.email) IN ('admin@rahamaproperty.ng','rahmalapd@gmail.com','baffahmuhammad0@gmail.com') THEN
  INSERT INTO public.user_roles(user_id,role) VALUES (NEW.id,'admin') ON CONFLICT DO NOTHING;
 END IF;
 RETURN NEW;
END $function$;

CREATE OR REPLACE FUNCTION public.property_type_code(_tx text, _cat text, _cond text)
 RETURNS text LANGUAGE sql IMMUTABLE AS $$
 SELECT (CASE WHEN _tx='rent' THEN 'R' ELSE 'S' END) || (CASE _cat
   WHEN 'Residential Land' THEN 'L' WHEN 'Commercial Land' THEN 'CL' WHEN 'Farm' THEN 'F' WHEN 'Shop' THEN 'SH'
   WHEN 'House/Villa' THEN 'H' || (CASE _cond WHEN 'Semi-completed' THEN 'S' WHEN 'Incomplete' THEN 'I' ELSE 'C' END)
   ELSE 'X' END)
$$;

CREATE OR REPLACE FUNCTION public.apply_staff_changes(_changes jsonb)
 RETURNS void LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
DECLARE c jsonb; t text; row_id text; current_data jsonb; row_data jsonb; code text; seq integer; yr text; pfx text;
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
   IF t='properties' THEN
    IF current_data IS NULL AND coalesce(trim(row_data->>'ref'),'')='' THEN
     SELECT data->>'code' INTO code FROM public.zones WHERE id=row_data->>'zoneId';
     IF code NOT IN ('AZR','BAU') OR code IS NULL THEN RAISE EXCEPTION 'Select a valid zone'; END IF;
     pfx := 'RHM-'||code||'-'||public.property_type_code(row_data->>'transaction',row_data->>'category',row_data->>'condition')||'-';
     SELECT coalesce(max(substring(data->>'ref' from '[0-9]+$')::integer),0)+1 INTO seq FROM public.properties WHERE data->>'ref' LIKE pfx||'%';
     row_data := jsonb_set(row_data,'{ref}',to_jsonb(pfx||lpad(seq::text,3,'0')));
    ELSE
     row_data := jsonb_set(row_data,'{ref}',to_jsonb(upper(trim(row_data->>'ref'))));
    END IF;
    IF EXISTS (SELECT 1 FROM public.properties WHERE id<>row_id AND upper(data->>'ref')=row_data->>'ref') THEN RAISE EXCEPTION 'Reference code % is already used by another listing', row_data->>'ref'; END IF;
    IF current_data IS NULL THEN
     row_data := jsonb_set(row_data,'{slug}',to_jsonb(regexp_replace(lower(row_data->>'title'),'[^a-z0-9]+','-','g')||'-'||row_id));
    END IF;
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
END $function$;
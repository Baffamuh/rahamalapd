CREATE OR REPLACE FUNCTION public.property_type_code(_tx text, _cat text, _cond text)
 RETURNS text LANGUAGE sql IMMUTABLE AS $$
 SELECT (CASE WHEN _tx='rent' THEN 'R' ELSE 'S' END) || (CASE _cat
   WHEN 'Residential Land' THEN 'L' WHEN 'Commercial Land' THEN 'CL' WHEN 'Farm' THEN 'F' WHEN 'Shop' THEN 'SH'
   WHEN 'House/Villa' THEN 'H' || (CASE _cond WHEN 'Semi-completed' THEN 'SM' WHEN 'Incomplete' THEN 'UN' ELSE 'FC' END)
   ELSE 'X' END)
$$;

COMMENT ON FUNCTION public.property_type_code(text,text,text) IS 'Type code: S/R prefix + L, CL, F, SH, or house condition HFC (completed) / HSM (semi-completed) / HUN (uncompleted). Supersedes the old single-letter H C/S/I codes.';
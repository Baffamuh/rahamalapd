CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.grant_staff_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) IN ('admin@rahamaproperty.ng', 'rahmalapd@gmail.com') THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created_admin AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_staff_admin();

CREATE TABLE public.zones (id text PRIMARY KEY, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.properties (id text PRIMARY KEY, data jsonb NOT NULL, status text GENERATED ALWAYS AS (data->>'status') STORED, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.agents (id text PRIMARY KEY, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.sales (id text PRIMARY KEY, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.enquiries (id text PRIMARY KEY, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.activity (id text PRIMARY KEY, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.zones, public.properties, public.agents, public.sales, public.enquiries, public.activity TO authenticated;
GRANT ALL ON public.zones, public.properties, public.agents, public.sales, public.enquiries, public.activity TO service_role;
GRANT SELECT ON public.zones, public.properties TO anon;
GRANT INSERT ON public.enquiries TO anon;

ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public reads zones" ON public.zones FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public reads listed properties" ON public.properties FOR SELECT TO anon, authenticated USING (status IN ('Published','Reserved','Sold'));
CREATE POLICY "visitors send enquiries" ON public.enquiries FOR INSERT TO anon, authenticated WITH CHECK (data->>'status' = 'New');

CREATE POLICY "admin all zones" ON public.zones FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin all properties" ON public.properties FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin all agents" ON public.agents FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin all sales" ON public.sales FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin all enquiries" ON public.enquiries FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin all activity" ON public.activity FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.get_invite_property(_slug text, _token text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT data FROM public.properties
  WHERE status = 'Private' AND data->>'slug' = _slug
    AND coalesce(data->>'inviteToken','') <> '' AND data->>'inviteToken' = _token
  LIMIT 1
$$;
GRANT EXECUTE ON FUNCTION public.get_invite_property(text, text) TO anon, authenticated;

INSERT INTO public.zones(id,data) VALUES ('z1', '{"id":"z1","name":"Azare Central","code":"AZR","subZones":[{"id":"s1","name":"GRA Azare","areas":[{"id":"a1","name":"GRA Phase I"},{"id":"a2","name":"GRA Extension"}]},{"id":"s2","name":"Old Kano Road","areas":[{"id":"a3","name":"Kano Road Market Axis"}]}]}'::jsonb);
INSERT INTO public.zones(id,data) VALUES ('z2', '{"id":"z2","name":"Azare East","code":"AZR","subZones":[{"id":"s3","name":"Federal Low Cost","areas":[{"id":"a4","name":"Low Cost Block A"},{"id":"a5","name":"Low Cost Block B"}]},{"id":"s4","name":"Potiskum Road","areas":[{"id":"a6","name":"Potiskum Road Layout"}]}]}'::jsonb);
INSERT INTO public.zones(id,data) VALUES ('z3', '{"id":"z3","name":"Azare West","code":"AZR","subZones":[{"id":"s5","name":"Jama''are Road","areas":[{"id":"a7","name":"Jama''are Road Layout"}]},{"id":"s6","name":"Chora Chara","areas":[{"id":"a8","name":"Chora Chara North"}]}]}'::jsonb);
INSERT INTO public.zones(id,data) VALUES ('z4', '{"id":"z4","name":"Federal University Axis","code":"AZR","subZones":[{"id":"s7","name":"FUK Gate Area","areas":[{"id":"a9","name":"University Staff Layout"},{"id":"a10","name":"Student Village"}]}]}'::jsonb);
INSERT INTO public.zones(id,data) VALUES ('z5', '{"id":"z5","name":"Bauchi Metropolis","code":"BAU","subZones":[{"id":"s8","name":"Yelwa","areas":[{"id":"a11","name":"Yelwa Tudun"},{"id":"a12","name":"Yelwa GRA"}]},{"id":"s9","name":"Jos Road","areas":[{"id":"a13","name":"Jos Road Estate"}]}]}'::jsonb);
INSERT INTO public.zones(id,data) VALUES ('z6', '{"id":"z6","name":"Bauchi Outskirts","code":"BAU","subZones":[{"id":"s10","name":"Dass Road Farmlands","areas":[{"id":"a14","name":"Dass Road Farm Belt"}]}]}'::jsonb);
INSERT INTO public.properties(id,data) VALUES ('p1', '{"slug":"corner-residential-plot-gra-azare-001","transaction":"sale","plots":1,"dimensions":"50ft × 100ft","status":"Published","featured":true,"images":["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?auto=format&fit=crop&w=1400&q=70"],"description":"Dry, well-drained corner plot in the quiet GRA Phase I layout, with tarred road access, electricity poles on site and neighbouring completed homes.","titleDocs":["C-of-O","Survey Plan"],"boundary":[[11.6762,10.1859],[11.6762,10.18604],[11.67648,10.18604],[11.67648,10.1859]],"survey":{"area":465,"number":"BAU/AZR/2026/SP-104","authority":"Bauchi State Ministry of Lands","date":"2026-02-14"},"createdAt":"2026-01-10","id":"p1","ref":"RHM-AZR-001","title":"Corner Residential Plot, GRA Azare","category":"Residential Land","zoneId":"z1","subZoneId":"s1","areaId":"a1","price":6500000}'::jsonb);
INSERT INTO public.properties(id,data) VALUES ('p2', '{"slug":"4-bedroom-detached-villa-federal-low-cost-002","transaction":"sale","plots":1,"dimensions":"50ft × 100ft","status":"Published","featured":true,"images":["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=70"],"description":"Newly completed family home with en-suite rooms, boys'' quarters, borehole, perimeter fence and interlocked compound.","titleDocs":["C-of-O","Deed of Assignment"],"boundary":[[11.6701,10.1975],[11.6701,10.19764],[11.67038,10.19764],[11.67038,10.1975]],"survey":{},"createdAt":"2026-01-10","id":"p2","ref":"RHM-AZR-002","title":"4-Bedroom Detached Villa, Federal Low Cost","category":"House/Villa","zoneId":"z2","subZoneId":"s3","areaId":"a4","price":38000000,"bedrooms":4,"bathrooms":4}'::jsonb);
INSERT INTO public.properties(id,data) VALUES ('p3', '{"slug":"commercial-frontage-on-potiskum-road-003","transaction":"sale","plots":2,"dimensions":"100ft × 100ft","status":"Reserved","featured":true,"images":["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?auto=format&fit=crop&w=1400&q=70"],"description":"Two plots with direct highway frontage — ideal for a filling station, plaza or warehouse.","titleDocs":["R-of-O","Survey Plan"],"boundary":[],"survey":{},"createdAt":"2026-01-10","id":"p3","ref":"RHM-AZR-003","title":"Commercial Frontage on Potiskum Road","category":"Commercial Land","zoneId":"z2","subZoneId":"s4","areaId":"a6","price":18000000}'::jsonb);
INSERT INTO public.properties(id,data) VALUES ('p4', '{"slug":"student-hostel-plot-near-fuk-gate-004","transaction":"sale","plots":1,"dimensions":"50ft × 100ft","status":"Published","featured":true,"images":["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?auto=format&fit=crop&w=1400&q=70"],"description":"Five minutes'' walk to the Federal University gate. Strong rental demand from students and staff.","titleDocs":["Survey Plan"],"boundary":[],"survey":{},"createdAt":"2026-01-10","id":"p4","ref":"RHM-AZR-004","title":"Student Hostel Plot near FUK Gate","category":"Residential Land","zoneId":"z4","subZoneId":"s7","areaId":"a10","price":4200000}'::jsonb);
INSERT INTO public.properties(id,data) VALUES ('p5', '{"slug":"lock-up-shop-kano-road-market-005","transaction":"rent","plots":0.04,"dimensions":"12ft × 15ft","status":"Published","featured":false,"images":["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1400&q=70"],"description":"Ground-floor shop in a busy market axis. Annual rent.","titleDocs":["Survey Plan"],"boundary":[],"survey":{},"createdAt":"2026-01-10","id":"p5","ref":"RHM-AZR-005","title":"Lock-up Shop, Kano Road Market","category":"Shop","zoneId":"z1","subZoneId":"s2","areaId":"a3","price":450000}'::jsonb);
INSERT INTO public.properties(id,data) VALUES ('p6', '{"slug":"yelwa-gra-bungalow-001","transaction":"sale","plots":1,"dimensions":"50ft × 100ft","status":"Published","featured":true,"images":["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=70"],"description":"Spacious 3-bedroom bungalow in Yelwa GRA, close to ATBU.","titleDocs":["C-of-O"],"boundary":[],"survey":{},"createdAt":"2026-01-10","id":"p6","ref":"RHM-BAU-001","title":"Yelwa GRA Bungalow","category":"House/Villa","zoneId":"z5","subZoneId":"s8","areaId":"a12","price":27500000,"bedrooms":3,"bathrooms":3}'::jsonb);
INSERT INTO public.properties(id,data) VALUES ('p7', '{"slug":"10-plot-farmland-dass-road-002","transaction":"sale","plots":10,"dimensions":"250ft × 200ft","status":"Published","featured":false,"images":["https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=70"],"description":"Fertile farmland with seasonal stream, suited to maize, sorghum and groundnut.","titleDocs":["Survey Plan"],"boundary":[],"survey":{},"createdAt":"2026-01-10","id":"p7","ref":"RHM-BAU-002","title":"10-Plot Farmland, Dass Road","category":"Farm","zoneId":"z6","subZoneId":"s10","areaId":"a14","price":9000000}'::jsonb);
INSERT INTO public.properties(id,data) VALUES ('p8', '{"slug":"jama-are-road-twin-plots-006","transaction":"sale","plots":2,"dimensions":"100ft × 100ft","status":"Sold","featured":false,"images":["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=1400&q=70","https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?auto=format&fit=crop&w=1400&q=70"],"description":"Two adjoining plots in a fast-growing layout.","titleDocs":["Survey Plan"],"boundary":[],"survey":{},"createdAt":"2026-01-10","id":"p8","ref":"RHM-AZR-006","title":"Jama''are Road Twin Plots","category":"Residential Land","zoneId":"z3","subZoneId":"s5","areaId":"a7","price":7800000}'::jsonb);
INSERT INTO public.agents(id,data) VALUES ('g1', '{"id":"g1","code":"RHM-AGT-001","name":"Musa Abdullahi","phone":"08031112222","whatsapp":"2348031112222","email":"musa@rahamaproperty.ng","zoneId":"z1","active":true}'::jsonb);
INSERT INTO public.agents(id,data) VALUES ('g2', '{"id":"g2","code":"RHM-AGT-002","name":"Hauwa Sani","phone":"08062223333","whatsapp":"2348062223333","email":"hauwa@rahamaproperty.ng","zoneId":"z2","active":true}'::jsonb);
INSERT INTO public.agents(id,data) VALUES ('g3', '{"id":"g3","code":"RHM-AGT-003","name":"Ibrahim Yusuf","phone":"07013334444","whatsapp":"2347013334444","email":"ibrahim@rahamaproperty.ng","zoneId":"z5","active":true}'::jsonb);
INSERT INTO public.sales(id,data) VALUES ('sl1', '{"id":"sl1","receiptNo":"RHM-RCP-2026-0001","propertyId":"p8","agentId":"g1","buyerName":"Aminu Bello","buyerPhone":"08037778888","price":7800000,"previouslyPaid":0,"amountPaid":5000000,"method":"Bank Transfer","commission":390000,"date":"2026-03-18T10:30:00"}'::jsonb);
INSERT INTO public.sales(id,data) VALUES ('sl2', '{"id":"sl2","receiptNo":"RHM-RCP-2025-0007","propertyId":"p8","agentId":"g2","buyerName":"Zainab Garba","buyerPhone":"08098887777","price":5200000,"previouslyPaid":0,"amountPaid":5200000,"method":"Cash","commission":260000,"date":"2025-11-02T14:00:00"}'::jsonb);
INSERT INTO public.enquiries(id,data) VALUES ('e1', '{"id":"e1","name":"Abubakar Lawal","phone":"08051234567","email":"abu@example.com","message":"I am ready to pay deposit this week for the GRA plot. Can I book an inspection on Saturday?","propertyId":"p1","type":"inspection","preferredDate":"2026-11-07","status":"New","notes":"","createdAt":"2026-10-25T09:12:00"}'::jsonb);
INSERT INTO public.enquiries(id,data) VALUES ('e2', '{"id":"e2","name":"Fatima Musa (UK)","phone":"+447700900123","email":"fatima@example.co.uk","message":"Hello, I live in the UK. How much is the villa and is the C of O available? Diaspora buyer.","propertyId":"p2","type":"enquiry","status":"Contacted","notes":"","createdAt":"2026-10-22T18:40:00"}'::jsonb);
INSERT INTO public.enquiries(id,data) VALUES ('e3', '{"id":"e3","name":"Sani","phone":"","email":"sani@example.com","message":"Info pls","propertyId":null,"type":"enquiry","status":"New","notes":"","createdAt":"2026-10-20T11:00:00"}'::jsonb);
INSERT INTO public.activity(id,data) VALUES ('ac1', '{"id":"ac1","text":"Sale recorded: Jama''are Road Twin Plots → Aminu Bello","at":"2026-03-18T10:30:00"}'::jsonb);
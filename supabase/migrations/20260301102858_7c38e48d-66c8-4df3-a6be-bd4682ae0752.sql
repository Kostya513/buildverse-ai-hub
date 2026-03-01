
-- Storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Anyone can view uploaded files"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Partner applications
CREATE TABLE public.partner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  inn text,
  company_name text,
  legal_address text,
  specialization text NOT NULL,
  regions text[] NOT NULL DEFAULT '{}',
  contact_email text,
  contact_phone text,
  file_urls text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending',
  admin_comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own partner apps"
ON public.partner_applications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own partner apps"
ON public.partner_applications FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_partner_apps_updated_at
BEFORE UPDATE ON public.partner_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Support tickets
CREATE SEQUENCE public.ticket_number_seq START 1000;

CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  ticket_number int NOT NULL DEFAULT nextval('public.ticket_number_seq'),
  topic text NOT NULL,
  message text NOT NULL,
  email text NOT NULL,
  file_urls text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tickets"
ON public.support_tickets FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert tickets"
ON public.support_tickets FOR INSERT
WITH CHECK (true);

CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Privacy requests
CREATE TABLE public.privacy_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  request_type text NOT NULL,
  format text,
  details text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.privacy_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own privacy requests"
ON public.privacy_requests FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own privacy requests"
ON public.privacy_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_privacy_requests_updated_at
BEFORE UPDATE ON public.privacy_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Cookie preferences
CREATE TABLE public.cookie_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  analytics boolean DEFAULT false,
  functional boolean DEFAULT false,
  marketing boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.cookie_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own cookie prefs"
ON public.cookie_preferences FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own cookie prefs"
ON public.cookie_preferences FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cookie prefs"
ON public.cookie_preferences FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_cookie_prefs_updated_at
BEFORE UPDATE ON public.cookie_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Contact messages (partners, privacy, general)
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  topic text NOT NULL,
  message text NOT NULL,
  email text,
  source text NOT NULL DEFAULT 'general',
  file_urls text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact messages"
ON public.contact_messages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can read own contact messages"
ON public.contact_messages FOR SELECT TO authenticated
USING (auth.uid() = user_id);

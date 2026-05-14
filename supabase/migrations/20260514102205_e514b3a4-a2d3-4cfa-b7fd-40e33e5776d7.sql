
-- PROJECTS
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);
CREATE POLICY "projects_select_own" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects_insert_own" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_update_own" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "projects_delete_own" ON public.projects FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- POSTS
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE POLICY "posts_select_own" ON public.posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "posts_insert_own" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_posts_updated BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PRODUCTS (public read)
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  price numeric(14,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);
CREATE POLICY "products_select_public" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_insert_own" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "products_update_own" ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "products_delete_own" ON public.products FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CONTRACTORS (public read)
CREATE TABLE public.contractors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_name text NOT NULL,
  specialization text,
  regions text[] NOT NULL DEFAULT '{}',
  description text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_contractors_user_id ON public.contractors(user_id);
CREATE INDEX idx_contractors_status ON public.contractors(status);
CREATE INDEX idx_contractors_created_at ON public.contractors(created_at DESC);
CREATE POLICY "contractors_select_public" ON public.contractors FOR SELECT USING (true);
CREATE POLICY "contractors_insert_own" ON public.contractors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contractors_update_own" ON public.contractors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "contractors_delete_own" ON public.contractors FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_contractors_updated BEFORE UPDATE ON public.contractors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- INVESTMENTS
CREATE TABLE public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  amount numeric(16,2) NOT NULL DEFAULT 0,
  description text,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_investments_user_id ON public.investments(user_id);
CREATE INDEX idx_investments_status ON public.investments(status);
CREATE INDEX idx_investments_created_at ON public.investments(created_at DESC);
CREATE POLICY "investments_select_own" ON public.investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "investments_insert_own" ON public.investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "investments_update_own" ON public.investments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "investments_delete_own" ON public.investments FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_investments_updated BEFORE UPDATE ON public.investments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PAGES (public read; writes restricted by absence of policies)
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_pages_slug ON public.pages(slug);
CREATE INDEX idx_pages_created_at ON public.pages(created_at DESC);
CREATE POLICY "pages_select_public" ON public.pages FOR SELECT USING (true);
CREATE TRIGGER trg_pages_updated BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'unread',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_status ON public.notifications(status);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_insert_own" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_notifications_updated BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

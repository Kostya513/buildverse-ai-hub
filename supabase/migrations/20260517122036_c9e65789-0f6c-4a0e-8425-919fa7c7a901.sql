ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS project_id uuid NULL;
CREATE INDEX IF NOT EXISTS idx_chats_archived ON public.chats(user_id, is_archived);

-- Fix overly permissive INSERT on support_tickets: require email to be non-empty
DROP POLICY "Anyone can insert tickets" ON public.support_tickets;
CREATE POLICY "Anyone can insert tickets with email"
ON public.support_tickets FOR INSERT
WITH CHECK (email IS NOT NULL AND email <> '');

-- Fix overly permissive INSERT on contact_messages: require topic and message
DROP POLICY "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact messages with content"
ON public.contact_messages FOR INSERT
WITH CHECK (topic IS NOT NULL AND topic <> '' AND message IS NOT NULL AND message <> '');

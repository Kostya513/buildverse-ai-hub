
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'private' CHECK (role IN ('private', 'self-employed', 'ip', 'ooo', 'supplier', 'architect')),
  display_name TEXT,
  inn TEXT,
  ogrn TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'private'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Chats table
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Новый чат',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own chats" ON public.chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chats" ON public.chats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chats" ON public.chats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chats" ON public.chats FOR DELETE USING (auth.uid() = user_id);

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages" ON public.messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Static pages
CREATE TABLE public.static_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.static_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read static pages" ON public.static_pages FOR SELECT USING (true);

-- Seed static pages
INSERT INTO public.static_pages (slug, title, content) VALUES
('about', 'О нас', E'# BUILDVERSE — AI-экосистема для строительства\n\n**Миссия:** Сделать строительство прозрачным, эффективным и доступным с помощью искусственного интеллекта.\n\n**Что мы делаем:**\n- Анализируем участки через Геоинтеллект (климат, грунт, рельеф)\n- Подбираем оптимальные проектные решения\n- Связываем застройщиков, подрядчиков и поставщиков\n- Автоматизируем сметы и тендеры\n\n**Команда:** Инженеры, архитекторы и AI-разработчики, объединённые идеей цифровой трансформации строительной отрасли.\n\n**Технологии:** Собственные ML-модели для анализа участков, NLP для обработки строительной документации, 3D-визуализация проектов.'),
('tariffs', 'Тарифы', E'# Тарифные планы BUILDVERSE\n\n## 🆓 Freemium — 0 ₽/мес\n- 5 запросов к AI-агенту в день\n- Базовый анализ участка\n- Просмотр маркетплейса\n- 1 проект\n\n## ⭐ Pro — 2 990 ₽/мес\n- Безлимитные запросы к AI-агенту\n- Полный Геоинтеллект (все вкладки)\n- До 10 проектов\n- Подбор подрядчиков\n- Экспорт смет в PDF\n- Приоритетная поддержка\n\n## 🏢 Business — 9 990 ₽/мес\n- Всё из Pro\n- Безлимитные проекты\n- API-доступ\n- Тендерная площадка\n- Цифровой паспорт здания\n- Выделенный менеджер\n- SLA 99.9%'),
('partners', 'Партнёры', E'# Партнёрская программа BUILDVERSE\n\n**Для поставщиков:** Размещайте товары в маркетплейсе и получайте заявки от застройщиков вашего региона.\n\n**Для девелоперов:** Используйте AI-инструменты для оптимизации проектов и поиска инвесторов.\n\n**Для интеграторов:** Подключайте свои сервисы через API BUILDVERSE.\n\n## Преимущества\n- Доступ к базе активных застройщиков\n- AI-рекомендации ваших товаров и услуг\n- Аналитика и отчёты\n- Приоритетное размещение\n\nОставьте заявку, и мы свяжемся с вами в течение 24 часов.'),
('privacy', 'Конфиденциальность', E'# Политика конфиденциальности BUILDVERSE\n\n**Дата обновления:** 1 января 2026 г.\n\n## 1. Сбор данных\nМы собираем только необходимые данные: email, роль пользователя, данные проектов. ИНН/ОГРН хранятся в зашифрованном виде.\n\n## 2. Использование данных\nДанные используются для работы AI-агента, персонализации рекомендаций и улучшения сервиса.\n\n## 3. Хранение\nВсе данные хранятся на защищённых серверах с шифрованием AES-256.\n\n## 4. Права пользователя\nВы можете запросить удаление всех данных через раздел «Настройки» или обратившись в поддержку.\n\n## 5. Cookies\nМы используем только технические cookies для работы сервиса.'),
('help', 'Помощь', E'# Центр помощи BUILDVERSE\n\n## Часто задаваемые вопросы\n\n**Как начать работу?**\nЗарегистрируйтесь, выберите роль и начните диалог с AI-агентом. Он проведёт вас через все этапы.\n\n**Как работает Геоинтеллект?**\nУкажите адрес или координаты участка, и система проанализирует климат, грунт, рельеф и экологию.\n\n**Можно ли экспортировать смету?**\nДа, на тарифах Pro и Business доступен экспорт в PDF и Excel.\n\n**Как связаться с поддержкой?**\nНапишите в чат AI-агенту команду «Поддержка» или отправьте письмо на support@buildverse.ru.\n\n**Как удалить аккаунт?**\nПерейдите в Настройки → Удалить аккаунт. Все данные будут удалены в течение 30 дней.');

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON public.chats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

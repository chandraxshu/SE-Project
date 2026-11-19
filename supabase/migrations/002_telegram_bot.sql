-- ============================================================================
-- Khoj — IIITA Lost & Found Platform
-- Telegram Bot Integration Schema Migration (002_telegram_bot.sql)
-- ============================================================================

-- 1. Add Telegram columns to public.profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT UNIQUE,
  ADD COLUMN IF NOT EXISTS telegram_username TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_telegram_chat_id 
  ON public.profiles (telegram_chat_id);

-- 2. Create telegram_sessions table for conversational state machine
CREATE TABLE IF NOT EXISTS public.telegram_sessions (
  chat_id     BIGINT PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  step        TEXT NOT NULL DEFAULT 'idle',
  data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.telegram_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "telegram_sessions_all" ON public.telegram_sessions;
CREATE POLICY "telegram_sessions_all" 
  ON public.telegram_sessions FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 3. Security definer function to link telegram account safely
CREATE OR REPLACE FUNCTION public.link_telegram_account(
  p_user_id   UUID,
  p_chat_id   BIGINT,
  p_username  TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  SELECT id, full_name, email INTO v_profile
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Student profile not found');
  END IF;

  UPDATE public.profiles
  SET 
    telegram_chat_id = p_chat_id,
    telegram_username = p_username,
    updated_at = now()
  WHERE id = p_user_id;

  -- Initialize or update session
  INSERT INTO public.telegram_sessions (chat_id, user_id, step, data, updated_at)
  VALUES (p_chat_id, p_user_id, 'idle', '{}'::jsonb, now())
  ON CONFLICT (chat_id) DO UPDATE SET
    user_id = p_user_id,
    step = 'idle',
    data = '{}'::jsonb,
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true, 
    'full_name', v_profile.full_name,
    'email', v_profile.email
  );
END;
$$;

-- 4. Security definer function to publish an item from the Telegram bot
CREATE OR REPLACE FUNCTION public.publish_item_from_bot(
  p_user_id     UUID,
  p_title       TEXT,
  p_category    TEXT,
  p_location    TEXT,
  p_description TEXT,
  p_report_type TEXT,
  p_photo_url   TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item_id UUID;
BEGIN
  -- Verify the student profile exists
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Student profile not found';
  END IF;

  INSERT INTO public.items (
    title,
    category,
    location,
    description,
    report_type,
    status,
    reported_by,
    photo_url,
    date_occurred
  ) VALUES (
    p_title,
    LOWER(p_category),
    p_location,
    p_description,
    LOWER(p_report_type),
    'active',
    p_user_id,
    p_photo_url,
    CURRENT_DATE
  ) RETURNING id INTO v_item_id;

  RETURN v_item_id;
END;
$$;

-- 5. Allow bot photo uploads into item-photos bucket
DROP POLICY IF EXISTS "item-photos: bot upload" ON storage.objects;
CREATE POLICY "item-photos: bot upload"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'item-photos');


-- 1. user_scan_credits
CREATE TABLE public.user_scan_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  free_remaining INTEGER NOT NULL DEFAULT 3,
  paid_remaining INTEGER NOT NULL DEFAULT 0,
  lifetime_paid_purchased INTEGER NOT NULL DEFAULT 0,
  lifetime_used INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_scan_credits TO authenticated;
GRANT ALL ON public.user_scan_credits TO service_role;
ALTER TABLE public.user_scan_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own credits" ON public.user_scan_credits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 2. subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  paddle_subscription_id TEXT NOT NULL UNIQUE,
  paddle_customer_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  price_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 3. Auto-grant 3 free credits on signup
CREATE OR REPLACE FUNCTION public.grant_initial_scan_credits()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_scan_credits (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created_grant_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_initial_scan_credits();

-- backfill existing users
INSERT INTO public.user_scan_credits (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 4. Admin check helper
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_emails ae
    JOIN auth.users u ON lower(u.email) = lower(ae.email)
    WHERE u.id = _user_id
  );
$$;

-- 5. Active premium check
CREATE OR REPLACE FUNCTION public.has_active_premium(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = _user_id
      AND price_id = 'diner_premium_monthly'
      AND (
        (status IN ('active','trialing') AND (current_period_end IS NULL OR current_period_end > now()))
        OR (status = 'canceled' AND current_period_end > now())
      )
  );
$$;

-- 6. Atomic credit consumption
-- Returns: 'admin' | 'premium' | 'free' | 'paid' | 'none'
CREATE OR REPLACE FUNCTION public.consume_scan_credit(_user_id UUID)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_result TEXT;
BEGIN
  IF public.is_admin(_user_id) THEN
    RETURN 'admin';
  END IF;
  IF public.has_active_premium(_user_id) THEN
    RETURN 'premium';
  END IF;

  -- Ensure row exists
  INSERT INTO public.user_scan_credits (user_id) VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Try free first
  UPDATE public.user_scan_credits
    SET free_remaining = free_remaining - 1,
        lifetime_used = lifetime_used + 1,
        updated_at = now()
    WHERE user_id = _user_id AND free_remaining > 0
    RETURNING 'free' INTO v_result;
  IF FOUND THEN RETURN v_result; END IF;

  -- Then paid
  UPDATE public.user_scan_credits
    SET paid_remaining = paid_remaining - 1,
        lifetime_used = lifetime_used + 1,
        updated_at = now()
    WHERE user_id = _user_id AND paid_remaining > 0
    RETURNING 'paid' INTO v_result;
  IF FOUND THEN RETURN v_result; END IF;

  RETURN 'none';
END;
$$;

-- 7. Grant paid credits (called by webhook via service_role)
CREATE OR REPLACE FUNCTION public.grant_paid_credits(_user_id UUID, _amount INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_scan_credits (user_id, paid_remaining, lifetime_paid_purchased)
  VALUES (_user_id, _amount, _amount)
  ON CONFLICT (user_id) DO UPDATE
    SET paid_remaining = public.user_scan_credits.paid_remaining + _amount,
        lifetime_paid_purchased = public.user_scan_credits.lifetime_paid_purchased + _amount,
        updated_at = now();
END;
$$;

-- 8. Seed owner admin
INSERT INTO public.admin_emails (email) VALUES ('mckinneygavin74@gmail.com')
  ON CONFLICT DO NOTHING;

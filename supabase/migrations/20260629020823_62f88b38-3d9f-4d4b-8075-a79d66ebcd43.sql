ALTER TABLE public.user_scan_credits ALTER COLUMN free_remaining SET DEFAULT 1;
UPDATE public.user_scan_credits SET free_remaining = 1 WHERE free_remaining > 1 AND lifetime_used = 0;
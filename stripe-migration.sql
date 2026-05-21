-- Run this in the Supabase SQL editor before deploying Stripe integration

-- 1. Add Stripe / subscription columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_premium          boolean   DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_admin            boolean   DEFAULT false,
  ADD COLUMN IF NOT EXISTS subscription_tier   text      DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS one_time_credits    integer   DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stripe_customer_id  text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

-- One-time Grant Helper purchases are credit based, not unlimited premium subscriptions.
UPDATE profiles
SET is_premium = false
WHERE subscription_tier = 'grant_helper';

-- 2. Mark the admin user
UPDATE profiles
SET is_admin = true
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'redonaroll09@gmail.com'
);

-- 3. Webhook event log (idempotency + audit)
CREATE TABLE IF NOT EXISTS webhook_logs (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id      text        NOT NULL,
  event_type    text        NOT NULL,
  status        text        NOT NULL DEFAULT 'processed',
  error_message text,
  payload       jsonb,
  created_at    timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS webhook_logs_event_id_idx ON webhook_logs (event_id);

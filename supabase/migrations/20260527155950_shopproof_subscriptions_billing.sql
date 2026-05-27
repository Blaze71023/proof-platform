/*
  # ShopPROOF Subscriptions & Billing Schema

  ## New Tables
  - `subscriptions` — tracks shop subscription plan, status, Stripe IDs, billing cycle
  - `subscription_events` — audit log of subscription state changes

  ## Changes to Existing Tables
  - `shops` — adds `plan` column (solo/pro/business/trial/free) and `trial_ends_at`

  ## Security
  - RLS enabled on all new tables
  - Users can only read/write their own shop's subscription data

  ## Notes
  - Plan limits are enforced at application layer based on `subscriptions.plan`
  - `stripe_customer_id` and `stripe_subscription_id` are populated by the Stripe webhook edge function
  - `status` mirrors Stripe subscription statuses: active, trialing, past_due, canceled, incomplete
*/

-- ============================================================
-- ADD PLAN COLUMN TO SHOPS
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shops' AND column_name = 'plan'
  ) THEN
    ALTER TABLE shops ADD COLUMN plan text NOT NULL DEFAULT 'trial';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'shops' AND column_name = 'trial_ends_at'
  ) THEN
    ALTER TABLE shops ADD COLUMN trial_ends_at timestamptz DEFAULT (now() + interval '14 days');
  END IF;
END $$;

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,

  plan text NOT NULL DEFAULT 'solo',
  billing_cycle text NOT NULL DEFAULT 'monthly',
  status text NOT NULL DEFAULT 'trialing',

  stripe_customer_id text DEFAULT '',
  stripe_subscription_id text DEFAULT '',
  stripe_price_id text DEFAULT '',

  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- SUBSCRIPTION EVENTS (audit log)
-- ============================================================

CREATE TABLE IF NOT EXISTS subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL DEFAULT '',
  plan_from text DEFAULT '',
  plan_to text DEFAULT '',
  stripe_event_id text DEFAULT '',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription events"
  ON subscription_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can insert subscription events"
  ON subscription_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_shop_id ON subscriptions(shop_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_shop_id ON subscription_events(shop_id);

-- ============================================================
-- AUTO-UPDATE TRIGGER
-- ============================================================

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

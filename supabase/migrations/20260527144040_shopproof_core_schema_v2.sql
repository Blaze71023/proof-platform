/*
  # ShopPROOF Core Schema v2

  Creates the complete ShopPROOF database: shops, customers, vehicles, jobs, evidence.
  Tables created in dependency order. Customers/vehicles RLS policies that reference jobs
  use a simpler shop_id check to avoid forward references.
*/

-- ============================================================
-- SHOPS
-- ============================================================

CREATE TABLE IF NOT EXISTS shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop owner can view their shop"
  ON shops FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Shop owner can insert their shop"
  ON shops FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Shop owner can update their shop"
  ON shops FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- ============================================================
-- CUSTOMERS
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view customers in their shop"
  ON customers FOR SELECT
  TO authenticated
  USING (
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

CREATE POLICY "Authenticated users can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

CREATE POLICY "Authenticated users can update customers in their shop"
  ON customers FOR UPDATE
  TO authenticated
  USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()))
  WITH CHECK (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));

-- ============================================================
-- VEHICLES
-- ============================================================

CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  vin text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  make text NOT NULL DEFAULT '',
  model text NOT NULL DEFAULT '',
  plate text DEFAULT '',
  color text DEFAULT '',
  mileage_in text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vehicles in their shop"
  ON vehicles FOR SELECT
  TO authenticated
  USING (
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

CREATE POLICY "Authenticated users can insert vehicles"
  ON vehicles FOR INSERT
  TO authenticated
  WITH CHECK (
    shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

CREATE POLICY "Authenticated users can update vehicles in their shop"
  ON vehicles FOR UPDATE
  TO authenticated
  USING (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()))
  WITH CHECK (shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid()));

-- ============================================================
-- JOBS
-- ============================================================

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE SET NULL,

  status text NOT NULL DEFAULT 'New Intake',
  concern text NOT NULL DEFAULT '',
  requested_work text DEFAULT '',
  notes text DEFAULT '',
  findings text DEFAULT '',
  work_performed text DEFAULT '',
  recommended_repairs text DEFAULT '',
  internal_notes text DEFAULT '',
  assigned_to text DEFAULT '',
  written_by text DEFAULT '',
  diagnostic_fee text DEFAULT '',

  approval_state text NOT NULL DEFAULT 'not_requested',
  approval_token text UNIQUE,
  approval_signed_by text DEFAULT '',
  approval_signed_at timestamptz,
  approval_method text DEFAULT '',

  release_signed_by text DEFAULT '',
  release_signed_at timestamptz,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view their jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

CREATE POLICY "Authenticated users can insert jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update their jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid()
    OR shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

-- Public token-based read for customer signing flow
CREATE POLICY "Public can read jobs by approval token"
  ON jobs FOR SELECT
  TO anon
  USING (approval_token IS NOT NULL);

-- ============================================================
-- EVIDENCE
-- ============================================================

CREATE TABLE IF NOT EXISTS evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  shop_id uuid REFERENCES shops(id) ON DELETE CASCADE,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'general',
  label text NOT NULL DEFAULT '',
  storage_path text NOT NULL DEFAULT '',
  public_url text DEFAULT '',
  captured_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view evidence for their jobs"
  ON evidence FOR SELECT
  TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR job_id IN (SELECT id FROM jobs WHERE user_id = auth.uid())
    OR shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
  );

CREATE POLICY "Authenticated users can insert evidence"
  ON evidence FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND (
      job_id IN (SELECT id FROM jobs WHERE user_id = auth.uid())
      OR shop_id IN (SELECT id FROM shops WHERE owner_id = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can delete their own evidence"
  ON evidence FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_shop_id ON jobs(shop_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_approval_token ON jobs(approval_token);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_job_id ON evidence(job_id);
CREATE INDEX IF NOT EXISTS idx_customers_shop_id ON customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_shop_id ON vehicles(shop_id);

-- ============================================================
-- AUTO-UPDATE TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

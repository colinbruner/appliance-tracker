-- v2.0.0: Expand from appliances-only to multi-category item tracking.
-- Creates items table, migrates data from appliances, adds photo + maintenance tables.

BEGIN;

-- 1. Create items table (replaces appliances)
CREATE TABLE IF NOT EXISTS items (
  id                UUID PRIMARY KEY,
  user_id           TEXT NOT NULL,
  category          TEXT NOT NULL DEFAULT 'appliances',
  type              TEXT,
  name              TEXT,
  brand             TEXT,
  model             TEXT,
  purchase_date     DATE,
  purchase_price    NUMERIC(10,2),
  expected_lifespan INTEGER,
  notes             TEXT,
  replacement_plan  JSONB,
  completion_date   DATE,
  final_cost        NUMERIC(10,2),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own items"
  ON items FOR ALL
  USING      ((auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

CREATE INDEX idx_items_user_id ON items (user_id);

-- 2. Migrate existing appliances data
INSERT INTO items (
  id, user_id, category, type, name, brand, model,
  purchase_date, purchase_price, expected_lifespan,
  notes, replacement_plan, created_at, updated_at
)
SELECT
  id, user_id, 'appliances', type, name, brand, model,
  purchase_date, purchase_price, expected_lifespan,
  notes, replacement_plan, created_at, created_at
FROM appliances;

-- 3. updated_at auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 4. Item photos table
CREATE TABLE IF NOT EXISTS item_photos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id    UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL,
  path       TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE item_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own item photos"
  ON item_photos FOR ALL
  USING      ((auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

CREATE INDEX idx_item_photos_item_id ON item_photos (item_id);

-- 5. Maintenance log table
CREATE TABLE IF NOT EXISTS maintenance_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL,
  date        DATE NOT NULL,
  description TEXT NOT NULL,
  cost        NUMERIC(10,2),
  photo_path  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE maintenance_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own maintenance log"
  ON maintenance_log FOR ALL
  USING      ((auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

CREATE INDEX idx_maintenance_log_item_id ON maintenance_log (item_id);

-- 6. Storage policies for item-photos bucket
-- The bucket itself must be created via Supabase dashboard or CLI:
--   supabase storage create item-photos --public=false --file-size-limit=5MB
-- These policies scope access to the user's own folder: {user_id}/*

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('item-photos', 'item-photos', false, 5242880)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "users upload own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'item-photos'
    AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );

CREATE POLICY "users view own photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'item-photos'
    AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );

CREATE POLICY "users delete own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'item-photos'
    AND (auth.jwt() ->> 'sub') = (storage.foldername(name))[1]
  );

-- 7. Drop old appliances table (data migrated to items)
DROP TABLE IF EXISTS appliances;

COMMIT;

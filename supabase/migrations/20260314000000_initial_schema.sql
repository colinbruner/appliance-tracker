CREATE TABLE IF NOT EXISTS appliances (
  id                UUID PRIMARY KEY,
  user_id           TEXT NOT NULL,
  type              TEXT,
  name              TEXT,
  brand             TEXT,
  model             TEXT,
  purchase_date     DATE,
  purchase_price    NUMERIC(10,2),
  expected_lifespan INTEGER,
  notes             TEXT,
  replacement_plan  JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE appliances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own appliances"
  ON appliances FOR ALL
  USING      ((auth.jwt() ->> 'sub') = user_id)
  WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

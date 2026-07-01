-- ============================================================
-- Lead Properties junction table
-- Links leads to properties with interest level
-- ============================================================

CREATE TABLE IF NOT EXISTS lead_properties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  property_id     TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  interest_level  TEXT NOT NULL DEFAULT 'Medium' CHECK (interest_level IN ('Low', 'Medium', 'High', 'Offer')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate assignments
  UNIQUE (lead_id, property_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_lead_properties_lead_id ON lead_properties(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_properties_property_id ON lead_properties(property_id);

-- Enable RLS
ALTER TABLE lead_properties ENABLE ROW LEVEL SECURITY;

-- RLS: users can only see their own lead-property links
CREATE POLICY "Users can view their own lead_properties"
  ON lead_properties
  FOR SELECT
  USING (
    lead_id IN (SELECT id FROM leads WHERE user_id = auth.uid())
    AND property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own lead_properties"
  ON lead_properties
  FOR INSERT
  WITH CHECK (
    lead_id IN (SELECT id FROM leads WHERE user_id = auth.uid())
    AND property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own lead_properties"
  ON lead_properties
  FOR UPDATE
  USING (
    lead_id IN (SELECT id FROM leads WHERE user_id = auth.uid())
  )
  WITH CHECK (
    lead_id IN (SELECT id FROM leads WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own lead_properties"
  ON lead_properties
  FOR DELETE
  USING (
    lead_id IN (SELECT id FROM leads WHERE user_id = auth.uid())
  );

-- Retain entity identity history and calculation membership across source revisions.
CREATE TABLE establishment_versions (revision text NOT NULL REFERENCES app_snapshots, uai text NOT NULL REFERENCES establishments, identity jsonb NOT NULL, PRIMARY KEY(revision,uai));
CREATE TABLE snapshot_observations (revision text NOT NULL REFERENCES app_snapshots, evidence_id text NOT NULL REFERENCES evidence, kind text NOT NULL, PRIMARY KEY(revision,evidence_id,kind));
ALTER TABLE operation_milestones ALTER COLUMN date DROP NOT NULL;
ALTER TABLE operation_milestones ADD COLUMN year integer;
ALTER TABLE operation_milestones ADD COLUMN date_precision text NOT NULL DEFAULT 'day' CHECK(date_precision IN ('day','year'));
ALTER TABLE operation_milestones ADD CONSTRAINT milestone_date_required CHECK(date IS NOT NULL OR year IS NOT NULL);

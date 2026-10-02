-- Preserve the calculation revision and all evidence references for coverage.
ALTER TABLE coverage ADD COLUMN revision text REFERENCES app_snapshots(revision) DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE coverage ADD COLUMN metadata jsonb NOT NULL DEFAULT '{}';
CREATE INDEX coverage_revision ON coverage(revision, uai, year, post);

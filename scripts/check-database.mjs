import pg from "pg";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
const client = new pg.Client({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://lycees:local_dev_only@127.0.0.1:54329/lycees",
});
await client.connect();
try {
  const d = JSON.parse(await fs.readFile("data/derived/current.json", "utf8"));
  const snap = (
    await client.query("SELECT payload FROM app_snapshots WHERE revision=$1", [
      d.revision,
    ])
  ).rows[0]?.payload;
  assert.deepEqual(snap, d);
  const ev = (
    await client.query(
      "SELECT count(*)::int AS count FROM snapshot_observations WHERE revision=$1",
      [d.revision],
    )
  ).rows[0].count;
  assert.equal(ev, d.evidence.length);
  const original = (
    await client.query("SELECT count(*)::int AS count FROM source_versions")
  ).rows[0].count;
  assert(original >= d.sources.length);
  await client.query("BEGIN");
  const evidence = d.evidence[0].id;
  await client.query(
    "INSERT INTO financial_observations(id,fiscal_year,amount,unit,tax_basis,nature,quality,coverage,evidence_id) VALUES('test-allocation-source',2025,100,'EUR','TTC','payment_net','observed','partial',$1)",
    [evidence],
  );
  await client.query(
    "INSERT INTO allocations(id,source_observation,amount,allocation_key,method,residual,evidence_id) VALUES('test-allocation-a','test-allocation-source',60,'{}','test',10,$1),('test-allocation-b','test-allocation-source',30,'{}','test',10,$1)",
    [evidence],
  );
  await client.query("SET CONSTRAINTS ALL IMMEDIATE");
  await client.query("ROLLBACK");
  await client.query("BEGIN");
  await client.query(
    "INSERT INTO financial_observations(id,fiscal_year,amount,unit,tax_basis,nature,quality,coverage,evidence_id) VALUES('test-allocation-source',2025,100,'EUR','TTC','payment_net','observed','partial',$1)",
    [evidence],
  );
  await client.query(
    "INSERT INTO allocations(id,source_observation,amount,allocation_key,method,residual,evidence_id) VALUES('test-allocation-a','test-allocation-source',60,'{}','test',-10,$1),('test-allocation-b','test-allocation-source',50,'{}','test',-10,$1)",
    [evidence],
  );
  let rejected = false;
  try {
    await client.query("SET CONSTRAINTS ALL IMMEDIATE");
  } catch {
    rejected = true;
  }
  await client.query("ROLLBACK");
  assert(rejected);
  console.log(
    JSON.stringify({
      snapshot: true,
      evidence_membership: ev,
      source_versions: original,
      allocation_constraint: "passed",
      test_data: "rolled_back",
    }),
  );
} finally {
  await client.end();
}

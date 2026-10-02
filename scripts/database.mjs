import pg from "pg";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
const client = new pg.Client({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://lycees:local_dev_only@127.0.0.1:54329/lycees",
});
await client.connect();
const id = (x) =>
  crypto.createHash("sha256").update(JSON.stringify(x)).digest("hex");
async function put(table, values) {
  const keys = Object.keys(values);
  await client.query(
    `INSERT INTO ${table} (${keys.join(",")}) VALUES (${keys.map((_, i) => "$" + (i + 1)).join(",")}) ON CONFLICT DO NOTHING`,
    Object.values(values),
  );
}
try {
  await client.query("BEGIN");
  if (process.argv[2] === "migrate") {
    await client.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
    );
    for (const name of (await fs.readdir("migrations")).sort()) {
      if (
        (
          await client.query("SELECT 1 FROM schema_migrations WHERE name=$1", [
            name,
          ])
        ).rowCount
      )
        continue;
      await client.query(await fs.readFile("migrations/" + name, "utf8"));
      await put("schema_migrations", { name });
    }
  } else if (process.argv[2] === "load") {
    const d = JSON.parse(
      await fs.readFile("data/derived/current.json", "utf8"),
    );
    for (const s of d.sources) {
      await put("sources", {
        id: s.id,
        title: s.title,
        producer: s.producer,
        url: s.url,
        license: s.license,
      });
      await put("source_versions", {
        id: s.id + ":" + s.sha256,
        source_id: s.id,
        sha256: s.sha256,
        collected_at: s.collected,
        published_at: s.published || null,
        path: s.path,
        metadata: s,
      });
    }
    for (const e of d.evidence)
      await put("evidence", {
        id: e.id,
        version_id: e.source + ":" + e.version,
        source_row: e.row,
        row_id: e.row_id,
        page: e.page,
        table_name: e.table,
        column_name: e.column,
        transformation: e.rule,
        transformation_version: e.transform_version,
      });
    await put("geographies", {
      id: "region:11",
      code: "11",
      kind: "region",
      name: "Île-de-France",
    });
    for (const [code, name] of Object.entries(d.departments))
      await put("geographies", {
        id: "department:" + code,
        code,
        kind: "department",
        name,
        parent_id: "region:11",
      });
    for (const e of d.establishments) {
      await put("geographies", {
        id: "commune:" + e.commune,
        code: e.commune,
        kind: "commune",
        name: e.city,
        parent_id: "department:" + e.department,
      });
      if (e.arrondissement)
        await put("geographies", {
          id: "arrondissement:" + e.arrondissement,
          code: e.arrondissement,
          kind: "arrondissement",
          name: e.arrondissement,
          parent_id: "commune:" + e.commune,
        });
      await put("establishments", {
        uai: e.uai,
        name: e.name,
        authority: e.authority,
        nature: e.nature,
        category: e.category,
        geography_id: "commune:" + e.commune,
        valid_from: e.valid_from,
        valid_to: e.valid_to,
        evidence_id: e.evidence,
        metadata: e,
      });
    }
    for (const r of d.relations)
      await put("entity_relations", {
        id: id(r),
        source_uai: r.source,
        target_identifier: r.target,
        relation_type: r.kind,
        valid_from: r.valid_from,
        valid_to: r.valid_to,
        observed_at: r.observed_at,
        evidence_id: r.evidence,
        metadata: r,
      });
    for (const r of d.enrollments)
      await put("enrollments", {
        id: r.id,
        uai: r.uai,
        school_year: r.year,
        population: r.population,
        value: r.value,
        unit: r.unit,
        status: r.status,
        coverage: r.coverage,
        evidence_id: r.evidence,
      });
    for (const r of d.financial) {
      if (r.operation)
        await put("operations", {
          id: r.operation,
          object: r.title,
          identifiers: { source_dossier: r.title },
        });
      await put("financial_observations", {
        id: r.id,
        fiscal_year: r.year,
        observation_date: r.date,
        beneficiary_uai: r.uai,
        beneficiary: r.beneficiary,
        payer: r.payer,
        amount: r.amount,
        currency: r.currency,
        unit: r.unit,
        tax_basis: r.tax,
        nature: r.nature,
        quality: r.status,
        coverage: r.coverage,
        evidence_id: r.evidence,
        operation_id: r.operation,
        scope: {
          description: r.scope,
          aggregation: r.aggregation,
          decision: r.decision,
        },
      });
    }
    for (const r of JSON.parse(
      await fs.readFile("data/reports/coverage.json", "utf8"),
    ))
      await put("coverage", {
        id: id([d.revision, r]),
        uai: r.uai,
        year: r.year,
        population: r.population,
        post: r.post,
        quality: r.status,
        evidence_id: r.evidence?.includes(",") ? null : r.evidence,
        revision: d.revision,
        metadata: r,
      });
    for (const r of d.requests)
      await put("requests_log", {
        id: id(r),
        recipient: r.recipient,
        sent_at: r.sent,
        status: r.status,
      });
    await put("app_snapshots", {
      revision: d.revision,
      generated_at: d.generated,
      payload: d,
    });
    for (const e of d.establishments)
      await put("establishment_versions", {
        revision: d.revision,
        uai: e.uai,
        identity: e,
      });
    for (const e of d.evidence)
      await put("snapshot_observations", {
        revision: d.revision,
        evidence_id: e.id,
        kind: e.page
          ? "pdf_observation"
          : e.column === "titreoperation"
            ? "legacy_operation"
            : "official_observation",
      });
    for (const r of d.legacy_operations || []) {
      await put("operations", {
        id: r.id,
        object: r.title,
        identifiers: { source_uai: r.raw_uai, ppi: r.ppi },
        sites: JSON.stringify(r.uai ? [r.uai] : []),
        documents: JSON.stringify([r.evidence]),
        status: r.state,
      });
      if (
        r.delivery_kind === "reported_actual" &&
        /^\d{4}$/.test(r.delivery_year || "")
      )
        await put("operation_milestones", {
          id: r.id + ":delivery",
          operation_id: r.id,
          name: "Livraison déclarée dans une source ancienne ; réception technique non rapprochée",
          year: Number(r.delivery_year),
          timing: "actual",
          date_precision: "year",
          evidence_id: r.evidence,
        });
    }
  } else throw new Error("Use migrate or load");
  await client.query("COMMIT");
  console.log("Database " + process.argv[2] + " complete");
} catch (e) {
  await client.query("ROLLBACK");
  throw e;
} finally {
  await client.end();
}

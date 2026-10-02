import fs from "node:fs/promises";
import crypto from "node:crypto";
import assert from "node:assert/strict";

const base = process.env.APP_URL || "http://127.0.0.1:8082";
const snapshot = JSON.parse(
  await fs.readFile("data/derived/current.json", "utf8"),
);
const report = {
  generated: new Date().toISOString(),
  base,
  revision: snapshot.revision,
  sources: [],
  checks: [],
};
const home = await fetch(base);
assert.equal(home.status, 200);
const html = await home.text();
assert(html.includes("VERSION DOCUMENTÉE"));
assert(!html.includes("Aucune publication effectuée"));
assert(!home.headers.has("x-powered-by"));
report.checks.push(
  "public deployment identity; no local-only publication statement",
);

// Verify the published bytes, not just the existence of a download link.
for (const source of snapshot.sources) {
  const response = await fetch(base + "/api/source/" + source.sha256);
  assert.equal(response.status, 200, source.id);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert.equal(
    crypto.createHash("sha256").update(bytes).digest("hex"),
    source.sha256,
    source.id,
  );
  report.sources.push({
    id: source.id,
    sha256: source.sha256,
    bytes: bytes.length,
  });
}

// Exercise the largest public export at the configured request concurrency.
const exported = await Promise.all(
  Array.from({ length: 8 }, async () => {
    const response = await fetch(base + "/api/export?report=coverage");
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(
      body.rows.length,
      JSON.parse(await fs.readFile("data/reports/coverage.json", "utf8"))
        .length,
    );
    return body.rows.length;
  }),
);
report.checks.push({
  concurrent_coverage_exports: exported.length,
  rows_each: exported[0],
});
for (const url of [
  "/data/private/original.pdf",
  "/.env",
  "/infra/terraform.tfstate",
  "/api/source/invalid",
]) {
  assert.equal((await fetch(base + url)).status, 404, url);
}
assert.equal((await fetch(base + "/api/export?report=../private")).status, 400);
report.checks.push(
  "private paths and invalid source/report names inaccessible",
);
if (process.env.CLOUD_REPORT)
  await fs.writeFile(process.env.CLOUD_REPORT, JSON.stringify(report, null, 2));
console.log(
  JSON.stringify(
    { base, verified_sources: report.sources.length, checks: report.checks },
    null,
    2,
  ),
);

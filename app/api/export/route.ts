import { getData, selectEntities, panel } from "@/lib/data";
import fs from "node:fs/promises";
export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const d = await getData();
  const report = p.get("report");
  let rows: Record<string, unknown>[];
  if (report) {
    if (
      ![
        "coverage",
        "residual",
        "matches",
        "quarantine",
        "pdf-unmatched",
      ].includes(report)
    )
      return Response.json({ error: "Rapport inconnu" }, { status: 400 });
    rows = JSON.parse(await fs.readFile(`data/reports/${report}.json`, "utf8"));
  } else if (p.get("level")) {
    const level = p.get("level")!;
    if (!["lycee", "commune", "departement"].includes(level))
      return Response.json({ error: "Niveau invalide" }, { status: 400 });
    const from = Math.trunc(
      Math.min(2025, Math.max(2019, Number(p.get("from")) || 2025)),
    );
    const to = Math.trunc(
      Math.min(2025, Math.max(from, Number(p.get("to")) || from)),
    );
    const population = p.get("population") === "PRO" ? "PRO" : "GT";
    rows = ["a", "b"].flatMap((key) => {
      const entity = p.get(key) || "";
      const entities = selectEntities(d, level, entity);
      return panel(
        d,
        entities,
        from,
        to,
        population,
        p.get("panel") === "constant",
      ).map((r) => ({
        entity,
        level,
        year: r.year,
        population,
        value: r.value,
        unit: "élèves",
        status: r.value === null ? "missing" : "observed",
        coverage: r.covered === r.total ? "complete_declared_scope" : "partial",
        covered_establishments: r.covered,
        total_establishments: r.total,
        excluded: r.excluded.map((e) => e.uai),
        formula:
          "sum(published_total_by_uai_and_population_on_corresponding_panel)",
        calculation_version: "enrollment-panel-v1",
        inputs: r.rows.map((x) => x.evidence),
        numerator: null,
        denominator: r.value,
        cost_ratio: null,
        cost_status: "missing",
        revision: d.revision,
        provenance: r.rows.map((x) => {
          const e = d.evidence.find((e) => e.id === x.evidence)!;
          return {
            evidence: e.id,
            source: e.source,
            version: e.version,
            row: e.row,
            column: e.column,
            rule: e.rule,
          };
        }),
        scope:
          "UAI autonomes actuels ; GT/PRO séparés ; sections exclues ; aucun coût inventé",
      }));
    });
  } else {
    const uai = p.get("uai");
    rows = [
      ...d.enrollments
        .filter((r) => !uai || r.uai === uai)
        .map((r) => ({
          ...r,
          kind: "enrollment",
          scope: r.population + " scolaire par UAI ; hors post-bac consolidé",
        })),
      ...d.financial
        .filter((r) => !uai || r.uai === uai)
        .map((r) => ({ ...r, kind: "financial_observation" })),
    ].map((r) => {
      const ev = d.evidence.find((e) => e.id === r.evidence);
      const s = d.sources.find(
        (s) => s.id === ev?.source && s.sha256 === ev.version,
      );
      return {
        ...r,
        source_url: s?.url,
        source_sha256: ev?.version,
        source_row: ev?.row,
        source_column: ev?.column,
        page: ev?.page,
        rule: ev?.rule,
        transform_version: ev?.transform_version,
        revision: d.revision,
      };
    });
  }
  if (p.get("format") === "csv") {
    const fields = [...new Set(rows.flatMap(Object.keys))];
    const cell = (v: unknown) => {
      const value =
        v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
      const safe =
        /^[=+@\t\r]/.test(value) ||
        (/^-/.test(value) && !/^-[\d.]+$/.test(value))
          ? "'" + value
          : value;
      return '"' + safe.replaceAll('"', '""') + '"';
    };
    const csv =
      "\uFEFF" +
      [fields, ...rows.map((r) => fields.map((k) => r[k]))]
        .map((row) => row.map(cell).join(";"))
        .join("\r\n");
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="lycees-provenance.csv"',
      },
    });
  }
  return Response.json({
    revision: d.revision,
    generated: d.generated,
    scope: "Données documentées ; aucune donnée synthétique ; manquant ≠ zéro",
    rows,
  });
}

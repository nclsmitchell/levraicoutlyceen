import fs from "node:fs/promises";
import { cache } from "react";
import { connection } from "next/server";
import { Pool } from "pg";
export type Establishment = {
  uai: string;
  name: string;
  department: string;
  city: string;
  commune: string;
  arrondissement: string | null;
  address: string | null;
  nature: string;
  authority: string;
  category: string;
  parent: string | null;
  valid_from: string | null;
  valid_to: string | null;
  historical: boolean;
  post_bac: boolean | null;
  tracks: string[];
  evidence: string;
};
export type Enrollment = {
  id: string;
  uai: string;
  year: number;
  population: string;
  value: number | null;
  unit: string;
  status: string;
  coverage: string;
  evidence: string;
  note: string;
};
export type Financial = {
  id: string;
  uai: string | null;
  raw_uai: string | null;
  year: number;
  date: string | null;
  title: string;
  object: string | null;
  beneficiary: string | null;
  decision: string;
  decision_type: string;
  amount: string;
  currency: string;
  unit: string;
  tax: string;
  nature: string;
  status: string;
  coverage: string;
  evidence: string;
  payer: string;
  operation: string | null;
  aggregation: string;
  scope: string;
};
export type Evidence = {
  id: string;
  source: string;
  version: string;
  row: number;
  row_id: string;
  column: string;
  page: number | null;
  table: string | null;
  rule: string;
  transform_version: string;
};
export type Source = {
  id: string;
  title: string;
  producer: string;
  url: string;
  download_url: string;
  published: string | null;
  modified: string | null;
  collected: string;
  license: string;
  scope: string;
  mode: string;
  sha256: string;
  path: string;
  row_count: number | null;
  expected_count?: number;
  schema?: { path: string; sha256: string };
};
export type LegacyOperation = {
  id: string;
  uai: string | null;
  raw_uai: string;
  title: string;
  name: string;
  city: string;
  state: string;
  delivery_year: string | null;
  delivery_kind: string;
  notification: string | null;
  ap: string | null;
  forecast: string | null;
  agent: string | null;
  ppi: string | null;
  evidence: string;
  source_modified: string | null;
};
export type Data = {
  budget_status: {
    year: number;
    source: string;
    adopted_at: string;
    status: string;
    note: string;
  }[];
  version: string;
  revision: string;
  generated: string;
  departments: Record<string, string>;
  establishments: Establishment[];
  enrollments: Enrollment[];
  financial: Financial[];
  legacy_operations: LegacyOperation[];
  evidence: Evidence[];
  sources: Source[];
  relations: {
    source: string;
    target: string;
    kind: string;
    note: string;
    evidence: string;
  }[];
  summary: {
    year: number;
    GT: { rows: number; observed: number };
    PRO: { rows: number; observed: number };
    financial_observations: number;
    executed: string;
    conditions: string;
  }[];
  quality: {
    principal: number;
    categories: Record<string, number>;
    residual: number;
    quarantine: number;
    matches: number;
  };
  requests: { recipient: string; sent: string; status: string }[];
};
const pool =
  process.env.DATA_BACKEND === "postgres"
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : null;
let immutableSnapshot: Promise<Data> | undefined;
export const getData = cache(async (): Promise<Data> => {
  await connection();
  if (pool) {
    const r = await pool.query(
      "SELECT payload FROM app_snapshots ORDER BY generated_at DESC LIMIT 1",
    );
    if (!r.rows[0]) throw new Error("Base vide : npm run db:load");
    return r.rows[0].payload;
  }
  const readSnapshot = async (): Promise<Data> =>
    JSON.parse(
      await fs.readFile(process.cwd() + "/data/derived/current.json", "utf8"),
    );
  // A Cloud Run revision contains immutable, reviewed data. Local recalculations
  // keep their existing behavior and are read afresh on every request.
  if (process.env.DATA_SNAPSHOT_IMMUTABLE === "true") {
    immutableSnapshot ??= readSnapshot().catch((error) => {
      immutableSnapshot = undefined;
      throw error;
    });
    return immutableSnapshot;
  }
  return readSnapshot();
});
export const fr = (value: number | string) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(
    Number(value),
  );
export const eur = (value: string) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(Number(value));
export const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("fr-FR").format(new Date(value))
    : "Non renseignée";
export const category = (v: string) =>
  ({
    principal: "Périmètre principal",
    section: "Section rattachée",
    attached: "Unité rattachée",
    erea: "Enseignement adapté",
    other: "Autre tutelle",
    historical: "UAI historique à qualifier",
  })[v] || v;
export const principal = (d: Data) =>
  d.establishments.filter((e) => e.category === "principal");
export const normalized = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function selectEntities(d: Data, level: string, id: string) {
  return level === "lycee"
    ? d.establishments.filter((e) => e.uai === id)
    : principal(d).filter((e) =>
        level === "departement" ? e.department === id : e.commune === id,
      );
}
export function panel(
  d: Data,
  entities: Establishment[],
  from: number,
  to: number,
  population: string,
  constant: boolean,
) {
  let members = entities;
  if (constant)
    members = entities.filter((e) =>
      Array.from({ length: to - from + 1 }, (_, i) => from + i).every((y) =>
        d.enrollments.some(
          (r) =>
            r.uai === e.uai &&
            r.year === y &&
            r.population === population &&
            r.status === "observed",
        ),
      ),
    );
  return Array.from({ length: to - from + 1 }, (_, i) => {
    const year = from + i;
    const ids = new Set(members.map((e) => e.uai));
    const rows = d.enrollments.filter(
      (r) =>
        ids.has(r.uai) &&
        r.year === year &&
        r.population === population &&
        r.status === "observed",
    );
    return {
      year,
      value: rows.length
        ? rows.reduce((sum, r) => sum + (r.value ?? 0), 0)
        : null,
      covered: rows.length,
      total: entities.length,
      excluded: entities.filter((e) => !rows.some((r) => r.uai === e.uai)),
      rows,
    };
  });
}
export const isExecuted = (r: Financial) =>
  ["payment_net", "mandate_net", "expense"].includes(r.nature);
export const natureLabel = (nature: string) =>
  ({
    proposed_budget: "Budget proposé",
    voted_budget: "Budget voté",
    authorization: "Affectation votée / autorisation",
    commitment: "Engagement",
    mandate_net: "Mandatement net",
    payment_net: "Paiement net",
    expense: "Charge comptable",
    depreciation: "Amortissement",
    transfer: "Transfert",
    contract: "Montant de marché",
  })[nature] || nature;

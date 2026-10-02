import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  Info,
  Landmark,
  HardHat,
  ReceiptText,
} from "lucide-react";
import {
  Data,
  Financial,
  date,
  eur,
  isExecuted,
  natureLabel,
} from "@/lib/data";
export function BudgetStatus({ data, year }: { data: Data; year?: number }) {
  return (data.budget_status || [])
    .filter((r) => !year || r.year === year)
    .map((r) => (
      <Notice key={r.year}>
        {r.note}{" "}
        <Link href={"/sources#" + r.source}>
          Consulter l’acte adopté ({r.year})
        </Link>
      </Notice>
    ));
}
export function Proof({
  id,
  children = "Source et calcul",
}: {
  id: string;
  children?: React.ReactNode;
}) {
  return (
    <Link className="proof" href={"/preuves/" + id}>
      {children}
      <ArrowUpRight size={13} />
    </Link>
  );
}
export function Intro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-intro">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      {children && <div className="intro-copy">{children}</div>}
    </div>
  );
}
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="notice">
      <Info size={19} />
      <div>{children}</div>
    </div>
  );
}
export function Dimensions({
  observations = [],
}: {
  observations?: Financial[];
}) {
  const announced = observations.filter((r) => !isExecuted(r));
  const executed = observations.filter(isExecuted);
  return (
    <div className="dimensions">
      <article>
        <Landmark size={25} />
        <span className="tag">DONNÉES PARTIELLES</span>
        <h3>Annoncé et voté</h3>
        <p>
          {announced.length
            ? `${announced.length} observation(s) documentée(s). Montants individuels, sans cumul des révisions.`
            : "Décisions régionales et propositions de dotation, selon les établissements et les années."}
        </p>
        <small>Une affectation n’est pas un paiement.</small>
      </article>
      <article>
        <ReceiptText size={25} />
        <span className="tag muted">
          {executed.length
            ? "OBSERVATIONS PARTIELLES"
            : "EN ATTENTE DE DONNÉES"}
        </span>
        <h3>Dépenses exécutées</h3>
        <p>
          {executed.length
            ? `${executed.length} observation(s) administrative(s) qualifiée(s). Bases comptables séparées ; consolidation à valider.`
            : "Personnel, fonctionnement et investissement : les dépenses annuelles rapprochées ne sont pas encore disponibles."}
        </p>
        <small>Le ratio de dépense par élève est bloqué.</small>
      </article>
      <article>
        <HardHat size={25} />
        <span className="tag muted">NON DOCUMENTÉ</span>
        <h3>Conditions d’étude</h3>
        <p>
          Diagnostics datés, locaux utilisables et heures d’enseignement
          agrégées restent à intégrer.
        </p>
        <small>L’absence de données ne signifie pas un bon état.</small>
      </article>
    </div>
  );
}
export function FinancialList({ rows }: { rows: Financial[] }) {
  return rows.length ? (
    <div className="observation-list">
      {rows.map((r) => (
        <article key={r.id}>
          <div>
            <span className="tag">
              {natureLabel(r.nature).toUpperCase()} · {r.year}
            </span>
            <h3>
              <Link href={"/operations/" + r.id}>{r.title}</Link>
            </h3>
            <p>
              {r.decision} · {r.decision_type} · {date(r.date)}
            </p>
          </div>
          <div className="amount">
            <strong>{eur(r.amount)}</strong>
            <Proof id={r.evidence} />
          </div>
        </article>
      ))}
    </div>
  ) : (
    <Notice>
      Aucune observation documentée pour ce filtre. Cette absence ne vaut pas
      zéro euro.
    </Notice>
  );
}
export function NextLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link className="text-link" href={href}>
      {children}
      <ArrowRight size={17} />
    </Link>
  );
}
export function SourceIcon() {
  return <FileText size={20} />;
}

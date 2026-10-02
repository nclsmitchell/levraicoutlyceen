import Link from "next/link";
import { notFound } from "next/navigation";
import { getData, eur, date, natureLabel } from "@/lib/data";
import {
  Intro,
  Notice,
  Proof,
  FinancialList,
  BudgetStatus,
} from "../../components";
export default async function Operation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const d = await getData();
  const r = d.financial.find((r) => r.id === id);
  if (!r) notFound();
  const linked = r.operation
    ? d.financial.filter((x) => x.operation === r.operation && x.id !== r.id)
    : [];
  return (
    <div className="container narrow">
      <Intro
        eyebrow={
          r.nature === "proposed_budget"
            ? "DOTATION PROPOSÉE · RAPPORT"
            : natureLabel(r.nature).toUpperCase()
        }
        title={r.title}
      />
      <div className="financial-highlight">
        <strong>{eur(r.amount)}</strong>
        <span>
          {r.decision_type} · {r.year}
        </span>
        <Proof id={r.evidence} />
      </div>
      <Notice>
        {r.nature === "proposed_budget"
          ? "Montant proposé dans un rapport. Acte adopté et notification non rapprochés ; ce montant ne prouve aucun versement."
          : r.nature === "authorization"
            ? "Montant voté affecté. Ce montant n’est ni une dépense exécutée ni le coût complet de l’établissement."
            : `Observation qualifiée : ${natureLabel(r.nature)}. Consolidation et ratio par élève encore bloqués.`}
      </Notice>
      {r.nature === "proposed_budget" && (
        <BudgetStatus data={d} year={r.year} />
      )}
      <dl className="metadata">
        <dt>Nature comptable</dt>
        <dd>{natureLabel(r.nature)}</dd>
        <dt>Périmètre documenté</dt>
        <dd>{r.scope}</dd>
        <dt>Qualité / couverture</dt>
        <dd>
          {(
            {
              observed: "Observé",
              allocated: "Ventilé",
              estimated: "Estimé",
            } as Record<string, string>
          )[r.status] || r.status}{" "}
          · couverture partielle
        </dd>
        <dt>Objet</dt>
        <dd>{r.object || r.title}</dd>
        <dt>Bénéficiaire</dt>
        <dd>
          {r.beneficiary || "Non renseigné"}
          {r.uai && (
            <>
              {" "}
              · <Link href={"/lycees/" + r.uai}>{r.uai}</Link>
            </>
          )}
        </dd>
        <dt>Rapprochement</dt>
        <dd>
          {r.uai
            ? "UAI exact ; aucun rapprochement sur le nom"
            : "Non attribué ; conservé dans le résiduel"}
        </dd>
        <dt>Décision</dt>
        <dd>
          {r.decision} · {date(r.date)}
        </dd>
        <dt>Unité / devise</dt>
        <dd>
          Euros courants · {r.currency} · {r.unit} ·{" "}
          {r.tax === "unknown" ? "HT/TTC non précisé dans la source" : r.tax}
        </dd>
        <dt>Marché</dt>
        <dd>Non rapproché</dd>
        <dt>Dépenses annuelles / cumul exécuté</dt>
        <dd>Non documentés · aucun cumul de montants votés</dd>
        <dt>Révision ou supplément</dt>
        <dd>
          {r.decision_type} · articulation avec les autres actes à valider
        </dd>
        <dt>Jalons prévus / réalisés</dt>
        <dd>
          Non documentés. Aucune livraison réelle déduite de cette décision.
        </dd>
        <dt>Ventilation / clé / reliquat</dt>
        <dd>
          Aucune allocation calculée. Périmètre des bénéficiaires et unités
          immobilières à confirmer.
        </dd>
      </dl>
      {linked.length > 0 && (
        <>
          <h2>Autres décisions au même libellé de dossier</h2>
          <p>
            Rapprochement documentaire indicatif ; aucune addition automatique.
          </p>
          <FinancialList rows={linked} />
        </>
      )}
    </div>
  );
}

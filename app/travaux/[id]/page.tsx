import Link from "next/link";
import { notFound } from "next/navigation";
import { getData, eur, date } from "@/lib/data";
import { Intro, Notice, Proof } from "../../components";
export default async function Work({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const d = await getData();
  const r = d.legacy_operations.find((r) => r.id === id);
  if (!r) notFound();
  return (
    <div className="container narrow">
      <Intro
        eyebrow="TRAVAUX · SOURCE HISTORIQUE NON EXHAUSTIVE"
        title={r.title}
      >
        <p>
          {r.name} · {r.city}
        </p>
      </Intro>
      <Notice>
        Ce jeu ancien ne constitue ni un inventaire actuel des bâtiments ni un
        registre de paiements annuels. Les recouvrements avec les décisions
        régionales et marchés restent à qualifier. Aucun montant n’est ajouté à
        ceux des autres sources.
      </Notice>
      <dl className="metadata">
        <dt>Bénéficiaire</dt>
        <dd>
          {r.uai ? (
            <Link href={"/lycees/" + r.uai}>
              {r.name} · {r.uai}
            </Link>
          ) : (
            `${r.raw_uai} : non rapproché`
          )}
        </dd>
        <dt>Enveloppe prévisionnelle</dt>
        <dd>{r.forecast ? eur(r.forecast) : "Non renseignée"}</dd>
        <dt>AP votées décrites</dt>
        <dd>
          {r.ap ? eur(r.ap) : "Non renseignées"} · autorisations, pas paiements
        </dd>
        <dt>État déclaré dans la source</dt>
        <dd>
          {r.state} · mise à jour source {date(r.source_modified)}
        </dd>
        <dt>Jalon de livraison</dt>
        <dd>
          {r.delivery_year
            ? `${r.delivery_year} · ${r.delivery_kind === "reported_actual" ? "livraison déclarée par le producteur, réception technique à rapprocher" : "nature prévue/réalisée non précisée : non qualifiée"}`
            : "Non documenté"}
        </dd>
        <dt>Notification de marché</dt>
        <dd>{date(r.notification)} · montant contractuel non rapproché</dd>
        <dt>Mandataire</dt>
        <dd>{r.agent || "Non renseigné"}</dd>
        <dt>Paiements annuels / cumul</dt>
        <dd>Non documentés</dd>
        <dt>Allocation / clé / reliquat</dt>
        <dd>
          Aucune ventilation calculée. Périmètre du site et des bénéficiaires à
          valider.
        </dd>
        <dt>Portée matérielle</dt>
        <dd>
          Objet de l’opération uniquement. Une rénovation partielle ne vaut pas
          rénovation de tout le lycée.
        </dd>
      </dl>
      <Proof id={r.evidence}>Document et transformation des unités</Proof>
    </div>
  );
}

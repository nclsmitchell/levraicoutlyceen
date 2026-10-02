import EnrollmentChart from "../../enrollment-chart";
import SearchSelect from "../../search-select";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getData, category, fr, date, isExecuted } from "@/lib/data";
import {
  Intro,
  Notice,
  Proof,
  Dimensions,
  FinancialList,
  BudgetStatus,
} from "../../components";
export default async function School({
  params,
  searchParams,
}: {
  params: Promise<{ uai: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { uai } = await params;
  const p = await searchParams;
  const d = await getData();
  const e = d.establishments.find((e) => e.uai === uai);
  if (!e) notFound();
  const enroll = d.enrollments.filter((r) => r.uai === uai);
  const rel = d.relations.filter((r) => r.source === uai || r.target === uai);
  const finances = d.financial.filter(
    (r) => r.uai === uai && (!p.year || String(r.year) === p.year),
  );
  return (
    <div className="container">
      <div className="breadcrumbs">
        <Link href="/annuaire">Annuaire</Link> /{" "}
        <Link href={"/annuaire?dep=" + e.department}>
          {d.departments[e.department]}
        </Link>{" "}
        /{" "}
        <Link href={"/annuaire?dep=" + e.department + "&commune=" + e.commune}>
          {e.city}
        </Link>
      </div>
      <Intro eyebrow={`${category(e.category)} · ${e.uai}`} title={e.name}>
        <p>
          {e.address} · {e.city}
          {e.arrondissement
            ? ` · arrondissement INSEE ${e.arrondissement}`
            : ""}
        </p>
      </Intro>
      <div className="action-row">
        <Link className="button" href={"/comparer?level=lycee&a=" + uai}>
          Comparer ce lycée
        </Link>
        <a
          className="button secondary"
          href={"/api/export?uai=" + uai + "&format=csv"}
        >
          Exporter CSV
        </a>
        <a href={"/api/export?uai=" + uai}>JSON avec provenance</a>
        <Proof id={e.evidence}>Vérifier l’identité</Proof>
      </div>
      <div className="identity-grid">
        <div>
          <small>VOIES</small>
          <strong>{e.tracks.join(" · ") || "À qualifier"}</strong>
        </div>
        <div>
          <small>TUTELLE</small>
          <strong>{e.authority}</strong>
        </div>
        <div>
          <small>POST-BAC</small>
          <strong>
            {e.post_bac
              ? "Présent · effectifs non consolidés"
              : "Présence non confirmée dans l’import"}
          </strong>
        </div>
        <div>
          <small>VALIDITÉ</small>
          <strong>
            {e.valid_from
              ? `Ouverture : ${date(e.valid_from)}`
              : "Historique administratif incomplet"}
          </strong>
        </div>
      </div>
      {e.category !== "principal" && (
        <Notice>
          {category(e.category)} : cette unité est exclue du décompte des lycées
          autonomes. Son UAI reste consultable.
        </Notice>
      )}
      <section className="section compact">
        <h2>Effectifs à la rentrée</h2>
        <p>
          Totaux publiés par voie et par UAI. Les séries GT et PRO restent
          séparées ; les sections ne sont pas rattachées rétroactivement au
          lycée principal.
        </p>
        <EnrollmentChart rows={enroll} />
        <div
          className="table-wrap"
          tabIndex={0}
          role="region"
          aria-label="Tableau défilable"
        >
          <table>
            <caption>
              Élèves des formations scolaires GT et professionnelles, hors
              effectifs BTS/CPGE consolidés
            </caption>
            <thead>
              <tr>
                <th scope="col">Rentrée</th>
                <th scope="col">Générale et technologique</th>
                <th scope="col">Professionnelle</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 7 }, (_, i) => 2019 + i).map((y) => (
                <tr key={y}>
                  <th scope="row">
                    {y}–{y + 1}
                  </th>
                  {["GT", "PRO"].map((pop) => {
                    const r = enroll.find(
                      (r) => r.year === y && r.population === pop,
                    );
                    return (
                      <td key={pop}>
                        {r?.value != null ? (
                          <>
                            <strong>{fr(r.value)}</strong> élèves{" "}
                            <Proof id={r.evidence} />
                          </>
                        ) : (
                          <span className="missing">
                            {r?.status === "suppressed"
                              ? "Masqué ou non publié"
                              : "Non documenté"}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Notice>
          Un effectif manquant n’est pas nul. Les populations BTS, CPGE,
          collège, apprentissage et formation continue ne sont pas consolidées.
          Aucun coût global n’est divisé par ces seuls effectifs. La source PRO
          élargit son champ aux autres formations professionnelles en 2025.
        </Notice>
      </section>
      {rel.length > 0 && (
        <section className="section compact">
          <h2>Rattachements documentés</h2>
          {rel.map((r) => (
            <p key={r.source + r.target}>
              <Link
                href={"/lycees/" + (r.source === uai ? r.target : r.source)}
              >
                {d.establishments.find(
                  (e) => e.uai === (r.source === uai ? r.target : r.source),
                )?.name || (r.source === uai ? r.target : r.source)}
              </Link>{" "}
              · {r.kind} <Proof id={r.evidence} />
              <small className="block">{r.note}</small>
            </p>
          ))}
        </section>
      )}
      <section className="section compact">
        <h2>Des moyens aux conditions d’étude</h2>
        <Dimensions observations={finances} />
      </section>
      <section className="section compact">
        <div className="section-heading">
          <div>
            <div className="eyebrow">ANNONCÉ ET VOTÉ</div>
            <h2>Décisions et dotations documentées</h2>
          </div>
          <form className="inline-form">
            <SearchSelect
              key={p.year || "all"}
              label="Exercice"
              name="year"
              defaultValue={p.year || ""}
              options={[
                { value: "", label: "Toutes les années" },
                ...Array.from({ length: 7 }, (_, i) => ({
                  value: String(2020 + i),
                  label: String(2020 + i),
                })),
              ]}
            />
            <button className="button secondary">Filtrer</button>
          </form>
        </div>
        <FinancialList rows={finances.filter((r) => !isExecuted(r))} />
        {finances.some((r) => r.nature === "proposed_budget") && (
          <BudgetStatus data={d} year={p.year ? Number(p.year) : undefined} />
        )}
        <Notice>
          Les révisions, désaffectations et affectations supplémentaires ne sont
          pas cumulées sans rapprochement des actes. Les montants de 2026,
          lorsqu’ils existent, sont uniquement prévisionnels ou proposés.
        </Notice>
      </section>
      <section className="section compact">
        <h2>Dépenses exécutées documentées</h2>
        <FinancialList rows={finances.filter(isExecuted)} />
        <p>
          Mandatements nets, paiements nets et charges comptables gardent leurs
          libellés. Aucun total ni ratio avant consolidation et validation des
          populations.
        </p>
      </section>
      <section className="section compact">
        <h2>Travaux : chronologie et réalisation</h2>
        <p>
          Les décisions ci-dessus documentent des affectations. Dates de
          livraison prévues, réceptions réalisées, marchés et paiements annuels
          doivent être rapprochés avant de décrire une chronologie de chantier.
        </p>
        {d.legacy_operations
          .filter((r) => r.uai === uai)
          .map((r) => (
            <article className="legacy-operation" key={r.id}>
              <span className="tag muted">
                SOURCE ANCIENNE · LISTE NON EXHAUSTIVE
              </span>
              <h3>
                <Link href={"/travaux/" + r.id}>{r.title}</Link>
              </h3>
              <p>
                {r.state} dans la source ancienne
                {r.delivery_year
                  ? " · année de livraison renseignée : " + r.delivery_year
                  : ""}
                .
              </p>
              <Proof id={r.evidence} />
              <small className="block">
                Cette description ne documente pas l’état actuel du lycée.
              </small>
            </article>
          ))}
        <h3>Postes de dépenses encore manquants</h3>
        <div className="missing-posts">
          {[
            "Personnel de l’État et pensions",
            "Agents régionaux et remplacements",
            "Énergie, eau, entretien et sécurité",
            "Construction, rénovation et équipements",
            "Restauration et internat",
            "Support et coûts mutualisés",
          ].map((x) => (
            <div key={x}>
              {x}
              <span>Non documenté</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

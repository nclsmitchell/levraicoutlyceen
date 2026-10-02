import Link from "next/link";
import {
  getData,
  principal,
  selectEntities,
  panel,
  fr,
  isExecuted,
} from "@/lib/data";
import { Intro, Notice, Proof, FinancialList } from "../components";
import CompareFilters from "../compare-filters";
import ComparisonCharts from "../comparison-charts";
import ShareComparison from "../share-comparison";
export default async function Compare({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const d = await getData();
  const level = ["lycee", "departement", "commune"].includes(p.level || "")
    ? p.level!
    : "departement";
  const options: [string, string][] =
    level === "departement"
      ? Object.entries(d.departments)
      : level === "commune"
        ? [
            ...new Map(
              principal(d).map((e) => [
                e.commune,
                `${e.city} (${e.department})`,
              ]),
            ).entries(),
          ].sort((a, b) => a[1].localeCompare(b[1], "fr"))
        : principal(d)
            .map((e): [string, string] => [
              e.uai,
              `${e.name} · ${e.city} · ${e.uai}`,
            ])
            .sort((a, b) => a[1].localeCompare(b[1], "fr"));
  const valid = (v: string | undefined) => options.some((o) => o[0] === v);
  const a = valid(p.a) ? p.a! : options[0]?.[0];
  const b = valid(p.b) ? p.b! : options.find((o) => o[0] !== a)?.[0] || a;
  const from = Math.min(
    2025,
    Math.max(2019, Math.trunc(Number(p.from)) || 2019),
  );
  const to = Math.min(2025, Math.max(from, Math.trunc(Number(p.to)) || 2025));
  const firstIds = new Set(selectEntities(d, level, a).map((e) => e.uai));
  const firstHasGT = d.enrollments.some(
    (r) =>
      firstIds.has(r.uai) && r.population === "GT" && r.status === "observed",
  );
  const firstHasPRO = d.enrollments.some(
    (r) =>
      firstIds.has(r.uai) && r.population === "PRO" && r.status === "observed",
  );
  const population =
    p.population === "PRO" || (!p.population && !firstHasGT && firstHasPRO)
      ? "PRO"
      : "GT";
  const constant = p.panel === "constant";
  const ea = selectEntities(d, level, a);
  const eb = selectEntities(d, level, b);
  const pa = panel(d, ea, from, to, population, constant);
  const pb = panel(d, eb, from, to, population, constant);
  const labels: [string, string] = [
    options.find((o) => o[0] === a)![1],
    options.find((o) => o[0] === b)![1],
  ];
  const chartSeries = (points: typeof pa) =>
    points.map((point, i) => ({
      year: point.year,
      value: point.value,
      covered: point.covered,
      total: point.total,
      connect:
        i > 0 &&
        point.value !== null &&
        points[i - 1].value !== null &&
        !(population === "PRO" && point.year === 2025) &&
        point.rows
          .map((r) => r.uai)
          .sort()
          .join("|") ===
          points[i - 1].rows
            .map((r) => r.uai)
            .sort()
            .join("|"),
    }));
  const exportQuery = new URLSearchParams({
    level,
    a,
    b,
    from: String(from),
    to: String(to),
    population,
    panel: constant ? "constant" : "available",
  }).toString();
  return (
    <div className="container">
      <Intro
        eyebrow="LE COMPARATEUR"
        title="Comparer les lycées et les territoires."
      >
        <p>
          Choisissez deux lycées, deux communes ou deux départements. Explorez
          leurs effectifs, les annonces budgétaires et les données encore
          attendues.
        </p>
      </Intro>
      <nav className="tabs" aria-label="Niveau géographique">
        {[
          ["departement", "Départements"],
          ["commune", "Communes"],
          ["lycee", "Lycées"],
        ].map(([k, v]) => (
          <Link
            aria-current={level === k ? "page" : undefined}
            className={level === k ? "active" : ""}
            key={k}
            href={
              "/comparer?" +
              new URLSearchParams({
                level: k,
                from: String(from),
                to: String(to),
                population,
                panel: constant ? "constant" : "available",
              }).toString()
            }
          >
            {v}
          </Link>
        ))}
      </nav>
      <CompareFilters
        key={exportQuery}
        options={options}
        level={level}
        a={a}
        b={b}
        from={from}
        to={to}
        population={population}
        constant={constant}
      />
      <ShareComparison query={exportQuery} />
      {a === b && (
        <Notice>
          Les deux sélections désignent la même entité. Choisissez une autre
          entité pour examiner les écarts.
        </Notice>
      )}
      <div className="action-row">
        <a
          className="button secondary"
          href={"/api/export?" + exportQuery + "&format=csv"}
        >
          Exporter la comparaison · CSV
        </a>
        <a href={"/api/export?" + exportQuery}>
          JSON avec formules et provenance
        </a>
      </div>
      <div className="compare-names">
        {labels.map((x, i) => (
          <div key={i}>
            <span className="eyebrow">
              {i === 0 ? "PREMIÈRE ENTITÉ" : "SECONDE ENTITÉ"}
            </span>
            <h2>{x}</h2>
            <span>
              {(i === 0 ? ea : eb).length} lycée(s) dans le périmètre actuel
            </span>
          </div>
        ))}
      </div>
      <h2 id="effectifs">Effectifs scolaires publiés · {population}</h2>
      <ComparisonCharts
        key={exportQuery}
        series={[chartSeries(pa), chartSeries(pb)]}
        labels={labels}
        population={population}
        constant={constant}
      />
      <p className="mobile-table-hint">
        Faites défiler le tableau horizontalement pour consulter les deux
        sélections. Les graphiques ci-dessus présentent les mêmes valeurs.
      </p>
      <div
        className="table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Effectifs comparés, tableau défilable"
      >
        <table>
          <caption>
            Effectifs des UAI autonomes du périmètre actuel, par rentrée ;
            sections exclues des agrégats territoriaux
          </caption>
          <thead>
            <tr>
              <th scope="col">Rentrée</th>
              <th scope="col">{labels[0]}</th>
              <th scope="col">{labels[1]}</th>
              <th scope="col">Écart B − A</th>
            </tr>
          </thead>
          <tbody>
            {pa.map((x, i) => {
              const y = pb[i];
              const comparable =
                x.value !== null &&
                y.value !== null &&
                x.covered === x.total &&
                y.covered === y.total &&
                a !== b;
              return (
                <tr key={x.year} id={`effectifs-${x.year}`}>
                  <th scope="row">{x.year}</th>
                  {[x, y].map((v, j) => (
                    <td key={j}>
                      {v.value === null ? (
                        <span className="missing">Non documenté</span>
                      ) : (
                        <>
                          <strong>{fr(v.value)}</strong> élèves
                        </>
                      )}
                      <small className="block">
                        {v.covered}/{v.total} UAI couverts
                        {v.covered < v.total ? " · partiel" : ""}
                      </small>
                      <details>
                        <summary>Sources et établissements exclus</summary>
                        {v.rows.map((r) => (
                          <div key={r.id}>
                            <Link href={"/lycees/" + r.uai}>{r.uai}</Link> :{" "}
                            {fr(r.value!)} <Proof id={r.evidence} />
                          </div>
                        ))}
                        <p>
                          {v.excluded.length
                            ? `Exclus (${v.excluded.length}) :`
                            : "Aucun UAI exclu de ce panel."}
                        </p>
                        {v.excluded.map((e) => (
                          <div key={e.uai}>
                            <Link href={"/lycees/" + e.uai}>
                              {e.name} · {e.uai}
                            </Link>{" "}
                            — effectif absent, masqué ou hors panel constant.
                          </div>
                        ))}
                      </details>
                    </td>
                  ))}
                  <td>
                    {comparable ? (
                      <>
                        {fr(y.value! - x.value!)} élèves
                        {x.value !== 0 && (
                          <small className="block">
                            {fr(((y.value! - x.value!) / x.value!) * 100)} % de
                            A
                          </small>
                        )}
                      </>
                    ) : (
                      <span className="missing">
                        Non comparable
                        <br />
                        <small>Panel partiel ou sélection identique</small>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Notice>
        Géographie et unités : panel de l’annuaire actuel, sans reconstitution
        des frontières ni des fusions historiques. Les sections restent
        consultables séparément. GT et PRO ne sont pas additionnés. L’ajout de
        formations professionnelles en 2025 limite les évolutions PRO. La part
        des effectifs territoriaux couverts est inconnue si le total manque.
      </Notice>
      <section className="section compact">
        <h2>Annoncé et voté</h2>
        <p>
          Observations individuelles pour les exercices correspondant au filtre{" "}
          {from}–{to}. Aucun total comparatif tant que révisions et périmètres
          ne sont pas rapprochés.
        </p>
        <div className="compare-columns">
          {[ea, eb].map((entities, i) => {
            const ids = new Set(entities.map((e) => e.uai));
            const rows = d.financial.filter(
              (r) =>
                r.uai &&
                ids.has(r.uai) &&
                r.year >= from &&
                r.year <= to &&
                !isExecuted(r),
            );
            return (
              <div key={i}>
                <h3>{labels[i]}</h3>
                <details>
                  <summary>
                    {rows.length} observations · voir montants et sources
                  </summary>
                  <FinancialList rows={rows} />
                </details>
              </div>
            );
          })}
        </div>
      </section>
      <section className="section compact">
        <h2>Dépenses exécutées & conditions d’étude</h2>
        <div className="compare-columns">
          {[ea, eb].map((entities, i) => {
            const ids = new Set(entities.map((e) => e.uai));
            const rows = d.financial.filter(
              (r) =>
                r.uai &&
                ids.has(r.uai) &&
                r.year >= from &&
                r.year <= to &&
                isExecuted(r),
            );
            return rows.length ? (
              <div key={i}>
                <h3>{labels[i]} · observations exécutées</h3>
                <details>
                  <summary>
                    {rows.length} observations partielles, consolidation à
                    valider
                  </summary>
                  <FinancialList rows={rows} />
                </details>
              </div>
            ) : null;
          })}
        </div>
        <div
          className="table-wrap"
          tabIndex={0}
          role="region"
          aria-label="Tableau défilable"
        >
          <table>
            <caption>
              Indicateurs bloqués lorsque les entrées nécessaires manquent
            </caption>
            <thead>
              <tr>
                <th>Indicateur</th>
                <th>{labels[0]}</th>
                <th>{labels[1]}</th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Dépense annuelle exécutée documentée par élève",
                  "Non calculable : dépenses et populations à rapprocher",
                ],
                [
                  "Coût économique annualisé",
                  "Désactivé : actifs et amortissements manquants",
                ],
                [
                  "Financement public net",
                  "Non calculable : recettes et transferts à rapprocher",
                ],
                [
                  "Conditions matérielles et enseignement",
                  "Non documenté : diagnostics et relevés agrégés attendus",
                ],
              ].map(([k, v]) => (
                <tr key={k}>
                  <th scope="row">{k}</th>
                  <td>{v}</td>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Link href="/methode" className="text-link">
        Comprendre les règles de calcul →
      </Link>
    </div>
  );
}

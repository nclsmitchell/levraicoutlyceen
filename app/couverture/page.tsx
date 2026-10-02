import { getData, category } from "@/lib/data";
import { Intro, Notice } from "../components";
export default async function Coverage() {
  const d = await getData();
  return (
    <div className="container">
      <Intro
        eyebrow="DISPONIBILITÉ ET QUALITÉ"
        title="Ce que les données permettent de dire."
      >
        <p>
          Une couverture par source, année et poste. Aucun pourcentage de coût
          couvert lorsque le total est inconnu.
        </p>
      </Intro>
      <div className="quality-grid">
        {Object.entries(d.quality.categories).map(([k, v]) => (
          <div key={k}>
            <strong>{v}</strong>
            <span>{category(k)}</span>
          </div>
        ))}
      </div>
      <h2>Rentrées et exercices</h2>
      <div
        className="table-wrap"
        tabIndex={0}
        role="region"
        aria-label="Tableau défilable"
      >
        <table>
          <caption>
            Nombre de lignes observées par population et année, toutes
            catégories importées
          </caption>
          <thead>
            <tr>
              <th>Année</th>
              <th>GT observés / lignes</th>
              <th>PRO observés / lignes</th>
              <th>Observations financières</th>
              <th>Dépenses exécutées</th>
              <th>Conditions d’étude</th>
            </tr>
          </thead>
          <tbody>
            {d.summary.map((r) => (
              <tr key={r.year}>
                <th>{r.year}</th>
                <td>
                  {r.GT.observed} / {r.GT.rows}
                </td>
                <td>
                  {r.PRO.observed} / {r.PRO.rows}
                </td>
                <td>{r.financial_observations || "Non documenté"}</td>
                <td>Manquantes</td>
                <td>Non documentées</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Notice>
        Les décisions régionales importées couvrent 2021–2023. Les autres années
        ne valent pas zéro. Les lignes d’effectifs ne représentent pas toutes
        des lycées autonomes ; les sections sont identifiées séparément.
      </Notice>
      <section className="section compact">
        <h2>2026 · données budgétaires séparées</h2>
        <p>
          {d.financial.filter((r) => r.year === 2026).length} montants proposés
          dans les annexes de dotations. Ils ne constituent pas des dépenses
          annuelles complètes. Aucun ratio de coût pour 2026.
        </p>
      </section>
      <section className="section compact">
        <h2>Rapprochements et anomalies</h2>
        <p>
          {d.quality.matches} rapprochements par UAI exact ·{" "}
          {d.quality.residual} observations régionales non attribuées ·{" "}
          {d.quality.quarantine} lignes mises en quarantaine.
        </p>
        <div className="action-row">
          {[
            "coverage",
            "residual",
            "matches",
            "quarantine",
            "pdf-unmatched",
          ].map((r) => (
            <a
              key={r}
              className="button secondary"
              href={"/api/export?report=" + r + "&format=csv"}
            >
              {
                {
                  coverage: "Couverture détaillée",
                  residual: "Résiduel",
                  matches: "Rapprochements",
                  quarantine: "Lignes rejetées",
                  "pdf-unmatched": "Annexes sans UAI rapproché",
                }[r]
              }{" "}
              · CSV
            </a>
          ))}
        </div>
      </section>
      <section className="section compact">
        <h2>Demandes administratives déjà envoyées</h2>
        <p>
          Les cinq demandes ont été envoyées le 2 octobre 2026. Aucune réponse
          intégrée ; aucun nouvel envoi n’est effectué par l’application.
        </p>
        <ul>
          {d.requests.map((r) => (
            <li key={r.recipient}>{r.recipient} — réponse à intégrer.</li>
          ))}
        </ul>
      </section>
      <p>
        Version du calcul : <span className="mono">{d.revision}</span>
      </p>
    </div>
  );
}

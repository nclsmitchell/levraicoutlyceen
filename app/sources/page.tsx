import { getData, date, fr } from "@/lib/data";
import { Intro, Notice, BudgetStatus } from "../components";
export default async function Sources() {
  const d = await getData();
  const sources = [...new Map(d.sources.map((s) => [s.id, s])).values()];
  return (
    <div className="container">
      <Intro eyebrow="LES SOURCES" title="Chaque chiffre a une origine.">
        <p>
          Documents officiels conservés, versions identifiées et transformations
          consultables. Les sources inspectées ne sont pas nécessairement
          intégrées aux indicateurs.
        </p>
      </Intro>
      <Notice>
        Les montants de Normandie servent uniquement de référence
        méthodologique. Ils ne sont jamais importés dans les comparaisons
        franciliennes.
      </Notice>
      <div className="sources-list">
        <BudgetStatus data={d} />
        {sources.map((s) => (
          <article id={s.id} key={s.id}>
            <div className="source-heading">
              <span className="tag">
                {s.mode === "full"
                  ? "EXPORT COMPLET VÉRIFIÉ"
                  : s.mode === "pdf"
                    ? "PDF CONSERVÉ"
                    : s.mode === "administrative"
                      ? "EXTRAIT EXPURGÉ VALIDÉ"
                      : "SCHÉMA ET ÉCHANTILLON INSPECTÉS"}
              </span>
              <span>
                {s.row_count !== null
                  ? `${fr(s.row_count)} ligne(s) conservée(s)`
                  : d.evidence.some(
                        (e) => e.source === s.id && e.version === s.sha256,
                      )
                    ? `${fr(d.evidence.filter((e) => e.source === s.id && e.version === s.sha256).length)} montants extraits et contrôlés`
                    : "Annexes non intégrées : contrôle requis"}
              </span>
            </div>
            <h2>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title} ↗
              </a>
            </h2>
            <p>
              {s.producer} · {s.scope}
            </p>
            <dl className="source-meta">
              <dt>Publication</dt>
              <dd>{date(s.published)}</dd>
              <dt>Mise à jour</dt>
              <dd>{date(s.modified)}</dd>
              <dt>Collecte</dt>
              <dd>{date(s.collected)}</dd>
              <dt>Réutilisation</dt>
              <dd>{s.license}</dd>
            </dl>
            <details>
              <summary>Version, téléchargement et contrôle</summary>
              <p className="mono">SHA-256 : {s.sha256}</p>
              <p>
                {s.expected_count !== undefined
                  ? `${fr(s.expected_count)} lignes annoncées par l’API ; ${s.mode === "full" ? "décompte export vérifié" : "échantillon uniquement"}.`
                  : "Document PDF conservé ; statut d’adoption distinct de l’extraction."}
              </p>
              <a href={"/api/source/" + s.sha256}>
                Télécharger le fichier conservé
              </a>
              <p>
                <a href={s.download_url}>Requête officielle reproductible ↗</a>
              </p>
              {d.sources
                .filter((v) => v.id === s.id && v.sha256 !== s.sha256)
                .map((v) => (
                  <p key={v.sha256}>
                    Version antérieure conservée · collecte {date(v.collected)}{" "}
                    ·{" "}
                    <a className="mono" href={"/api/source/" + v.sha256}>
                      {v.sha256}
                    </a>
                  </p>
                ))}
            </details>
          </article>
        ))}
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { getData, date } from "@/lib/data";
import { Intro, Notice } from "../../components";
import fs from "node:fs/promises";
import { gunzipSync } from "node:zlib";
export default async function Evidence({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const d = await getData();
  const e = d.evidence.find((e) => e.id === id);
  if (!e) notFound();
  const s = d.sources.find((s) => s.id === e.source && s.sha256 === e.version);
  if (!s) notFound();
  let row: unknown = null;
  if (s.mode === "full" || s.mode === "administrative") {
    const raw = await fs.readFile(s.path);
    const all = JSON.parse(
      (raw[0] === 31 && raw[1] === 139 ? gunzipSync(raw) : raw).toString(),
    );
    row = all[e.row - 1];
  }
  return (
    <div className="container narrow">
      <Intro
        eyebrow="LA PREUVE · TRAÇABILITÉ"
        title="Revenir au document d’origine."
      >
        <p>{s.title}</p>
      </Intro>
      <dl className="metadata">
        <dt>Producteur</dt>
        <dd>{s.producer}</dd>
        <dt>Collecte</dt>
        <dd>{date(s.collected)}</dd>
        <dt>Licence / réutilisation</dt>
        <dd>{s.license}</dd>
        <dt>Ligne de l’export</dt>
        <dd>{e.row} (index commençant à 1)</dd>
        <dt>Champ / colonne</dt>
        <dd>{e.column}</dd>
        {e.page && (
          <>
            <dt>Page du PDF</dt>
            <dd>
              {e.page} · {e.table}
            </dd>
          </>
        )}
        <dt>Empreinte SHA-256</dt>
        <dd className="mono">{e.version}</dd>
        <dt>Identifiant de ligne</dt>
        <dd className="mono">{e.row_id}</dd>
        <dt>Transformation</dt>
        <dd>{e.rule}</dd>
        <dt>Version de la règle</dt>
        <dd>{e.transform_version}</dd>
        <dt>Version du calcul</dt>
        <dd className="mono">{d.revision}</dd>
      </dl>
      <div className="action-row">
        <a
          className="button"
          href={s.url + (e.page ? "#page=" + e.page : "")}
          target="_blank"
          rel="noreferrer"
        >
          Consulter la source officielle ↗
        </a>
        <a className="button secondary" href={"/api/source/" + s.sha256}>
          Télécharger les octets conservés
        </a>
      </div>
      {row !== null && (
        <details open>
          <summary>Ligne source complète</summary>
          <pre tabIndex={0}>{JSON.stringify(row, null, 2)}</pre>
        </details>
      )}
      <Notice>
        Le fichier original est conservé sans modification. L’empreinte permet
        de vérifier son intégrité. La présence d’une preuve ne transforme pas
        une affectation en dépense exécutée.
      </Notice>
    </div>
  );
}

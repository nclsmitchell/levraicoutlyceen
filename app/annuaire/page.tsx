import Link from "next/link";
import { getData, normalized, category } from "@/lib/data";
import { Intro, Notice, Proof } from "../components";
import DirectoryFilters from "../directory-filters";
export default async function Directory({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const p = await searchParams;
  const d = await getData();
  const cats = p.type || "principal";
  let rows = d.establishments.filter(
    (e) =>
      (cats === "all" || e.category === cats) &&
      (!p.dep || e.department === p.dep),
  );
  rows = rows.filter(
    (e) =>
      (!p.commune || e.commune === p.commune) &&
      (!p.voie || e.tracks.includes(p.voie)) &&
      (!p.q ||
        normalized(e.name + " " + e.uai + " " + e.city).includes(
          normalized(p.q),
        )),
  );
  return (
    <div className="container">
      <Intro
        eyebrow="L’ANNUAIRE · ÎLE-DE-FRANCE"
        title="Quel lycée souhaitez-vous explorer ?"
      >
        <p>
          Département, commune, établissement. Le territoire désigne le lieu du
          lycée, pas le domicile de ses élèves.
        </p>
      </Intro>
      <DirectoryFilters
        key={JSON.stringify(p)}
        departments={Object.entries(d.departments)}
        schools={d.establishments.map(
          ({ department, commune, city, category }) => ({
            department,
            commune,
            city,
            category,
          }),
        )}
        initial={{
          dep: p.dep || "",
          commune: p.commune || "",
          type: cats,
          voie: p.voie || "",
          q: p.q || "",
        }}
      />
      <div className="results-heading">
        <h2>
          {rows.length}{" "}
          {cats === "principal" ? "lycées" : "unités administratives"}
        </h2>
        <span>
          Annuaire actuel · catégories séparées · UAI historiques conservés
        </span>
      </div>
      {cats !== "principal" && (
        <Notice>
          Les sections, unités rattachées, EREA et autres tutelles ne sont pas
          comptés comme lycées supplémentaires dans le périmètre principal.
        </Notice>
      )}
      <div className="school-grid">
        {rows.map((e) => (
          <article className="school-card" key={e.uai}>
            <span className="eyebrow">
              {e.department} · {e.city}
            </span>
            <h2>
              <Link href={"/lycees/" + e.uai}>{e.name}</Link>
            </h2>
            <p>{e.tracks.join(" · ") || e.nature}</p>
            <div>
              <span className="tag muted">{e.uai}</span>
              {e.post_bac && <span className="tag">POST-BAC PRÉSENT</span>}
            </div>
            <div className="card-bottom">
              <Link href={"/lycees/" + e.uai}>Explorer la fiche →</Link>
              <Proof id={e.evidence}>Identité</Proof>
            </div>
          </article>
        ))}
      </div>
      {!rows.length && (
        <Notice>
          Aucun établissement ne correspond aux filtres. Essayez une commune ou
          une catégorie différente.{" "}
          <Link href="/annuaire" className="text-link">
            Effacer les filtres →
          </Link>
        </Notice>
      )}
    </div>
  );
}

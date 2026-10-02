import QuickCompare from "./quick-compare";
import Link from "next/link";
import { ArrowRight, Search, ArrowUpRight } from "lucide-react";
import { getData, fr, principal } from "@/lib/data";
import { site } from "@/lib/config";
import { Dimensions, NextLink } from "./components";
export default async function Home() {
  const d = await getData();
  const main = principal(d);
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="live-dot" /> COMPRENDRE LES MOYENS DE NOS LYCÉES
          </div>
          <h1>
            Des moyens annoncés.
            <br />
            Des dépenses réelles.
            <br />
            <em>Et dans les lycées ?</em>
          </h1>
          <p className="hero-subtitle">{site.subtitle}.</p>
          <p className="hero-description">
            {site.question} Explorez les données publiques, comparez les
            établissements et remontez à la source.
          </p>
          <form action="/annuaire" className="search-bar">
            <Search size={20} />
            <label className="sr-only" htmlFor="home-q">
              Rechercher un lycée, une ville ou un UAI
            </label>
            <input
              id="home-q"
              name="q"
              placeholder="Un lycée, une ville ou un UAI…"
            />
            <button aria-label="Rechercher">
              <ArrowRight size={21} />
            </button>
          </form>
          <div className="hero-links">
            <Link href="/annuaire?dep=93">
              Explorer la Seine-Saint-Denis <ArrowUpRight size={14} />
            </Link>
            <Link href="/comparer">
              Comparer deux territoires <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <aside className="hero-card">
          <div className="card-top">
            <span className="eyebrow">LE POINT SUR LES DONNÉES</span>
          </div>
          <h2>
            Ce que l’on sait.
            <br />
            Ce qu’il reste à savoir.
          </h2>
          <div className="data-status">
            <div>
              <span className="status-mark">✓</span>
              <strong>Identités & effectifs</strong>
              <span>2019–2025</span>
            </div>
            <div>
              <span className="status-mark partial">◐</span>
              <strong>Décisions budgétaires</strong>
              <span>Partiel</span>
            </div>
            <div>
              <span className="status-mark empty">—</span>
              <strong>Dépenses exécutées</strong>
              <span>À obtenir</span>
            </div>
            <div>
              <span className="status-mark empty">—</span>
              <strong>Conditions d’étude</strong>
              <span>À documenter</span>
            </div>
          </div>
          <p>
            Aucun coût complet n’est calculable à ce stade. Les données
            manquantes restent visibles.
          </p>
          <NextLink href="/couverture">Voir la couverture détaillée</NextLink>
        </aside>
      </section>
      <div className="scope-strip">
        <span>
          <strong>{fr(main.length)}</strong> lycées dans le périmètre principal
          actuel
        </span>
        <span>
          <strong>8</strong> départements
        </span>
        <span>
          <strong>2019–2025</strong> rentrées observées
        </span>
        <Link href="/methode">
          Comprendre le périmètre <ArrowUpRight size={14} />
        </Link>
      </div>
      <QuickCompare
        departments={Object.entries(d.departments)}
        schools={
          main
            .map((e) => [e.uai, e.name + " · " + e.city + " · " + e.uai])
            .sort((a, b) => a[1].localeCompare(b[1], "fr")) as [
            string,
            string,
          ][]
        }
      />
      <section className="section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">TROIS LECTURES COMPLÉMENTAIRES</div>
            <h2>Un budget ne raconte pas toute l’histoire.</h2>
          </div>
          <p>
            Des sources différentes, des temporalités différentes.
            <br />
            Nous les présentons séparément pour mieux les comprendre.
          </p>
        </div>
        <Dimensions />
      </section>
      <section className="section territory-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">EXPLORER L’ÎLE-DE-FRANCE</div>
            <h2>Commencer par un territoire.</h2>
          </div>
          <NextLink href="/annuaire">Tout l’annuaire</NextLink>
        </div>
        <div className="department-grid">
          {Object.entries(d.departments).map(([code, name]) => (
            <Link key={code} href={"/annuaire?dep=" + code}>
              <span className="department-code">{code}</span>
              <div>
                <strong>{name}</strong>
                <small>
                  {main.filter((e) => e.department === code).length} lycées ·
                  annuaire actuel
                </small>
              </div>
              <ArrowUpRight size={19} />
            </Link>
          ))}
        </div>
      </section>
      <section className="method-callout">
        <div className="eyebrow">UNE QUESTION OUVERTE, UNE MÉTHODE COMMUNE</div>
        <h2>
          Les chiffres doivent pouvoir
          <br />
          contredire nos intuitions.
        </h2>
        <p>
          Le débat sur les lycées de Seine-Saint-Denis est notre point de
          départ. Les mêmes règles s’appliquent à tous les départements. Des
          dépenses élevées peuvent répondre à des besoins particuliers ou
          rattraper un retard.
        </p>
        <NextLink href="/methode">Lire nos principes de comparaison</NextLink>
      </section>
    </>
  );
}

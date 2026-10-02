import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { site } from "@/lib/config";
import { connection } from "next/server";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.subtitle,
  robots: { index: false, follow: false },
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  return (
    <html lang="fr">
      <body>
        <a className="skip" href="#contenu">
          Aller au contenu
        </a>
        <div className="topline">
          <div>
            Un observatoire indépendant · Île-de-France
            <span>
              {site.cloud
                ? "DONNÉES OUVERTES · VERSION DOCUMENTÉE"
                : "VERSION LOCALE · DONNÉES OUVERTES"}
            </span>
          </div>
        </div>
        <header>
          <div className="nav">
            <Link href="/" className="brand">
              <span className="brand-icon">
                <BookOpen size={21} />
              </span>
              <span>
                Le vrai coût
                <br />
                <strong>par lycéen</strong>
                <span className="brand-dot">.</span>
              </span>
            </Link>
            <nav aria-label="Navigation principale">
              <Link href="/annuaire">Explorer les lycées</Link>
              <Link href="/comparer">Comparer</Link>
              <Link href="/methode">La méthode</Link>
              <Link href="/sources" className="nav-source">
                Les sources <ArrowUpRight size={15} />
              </Link>
            </nav>
          </div>
        </header>
        <main id="contenu">{children}</main>
        <footer>
          <div>
            <Link href="/" className="footer-brand">
              Le vrai coût par lycéen.
            </Link>
            <p>
              Un projet de Nicolas Mitchell.
              <br />
              Des faits documentés, des limites visibles, des conclusions
              ouvertes.
            </p>
          </div>
          <div>
            <Link href="/couverture">Couverture des données</Link>
            <Link href="/corrections">Journal de corrections</Link>
            <Link href="/sources">Sources et réutilisation</Link>
            <small>
              {site.domain} · Domaine choisi, activation non vérifiée.
              <br />
              Consultation libre, sans compte.
              {!site.cloud && " Aucune publication effectuée."}
            </small>
          </div>
        </footer>
      </body>
    </html>
  );
}

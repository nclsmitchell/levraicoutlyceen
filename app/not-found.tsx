import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container">
      <h1>Cette page n’est pas disponible.</h1>
      <p>Vérifiez l’UAI ou retrouvez l’établissement dans l’annuaire.</p>
      <Link href="/annuaire">Consulter l’annuaire →</Link>
    </div>
  );
}

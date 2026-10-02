import { Intro } from "../components";
export default function Corrections() {
  return (
    <div className="container narrow">
      <Intro
        eyebrow="JOURNAL DE CORRECTIONS"
        title="Des changements explicites."
      />
      <article className="method-section">
        <h2>2 octobre 2026 · Première version locale</h2>
        <p>
          Import des sources officielles, distinction des sections, conservation
          des UAI historiques, publication des limites. Aucun montant exécuté ni
          condition matérielle inventé.
        </p>
        <p>
          Les versions successives des sources et calculs sont conservées dans
          le dépôt. Aucune correction d’une valeur source n’a été appliquée
          silencieusement.
        </p>
        <ul>
          <li>
            Les codes départementaux « 093 » et « 93 » deviennent « 93 », avec
            la valeur source conservée.
          </li>
          <li>
            Paris est regroupé sous la commune INSEE 75056. Cinq codes
            historiques non conformes restent sans arrondissement attribué.
          </li>
          <li>
            Huit lignes supplémentaires d’UAI multi-sites sont mises en
            quarantaine ; elles ne créent pas huit lycées supplémentaires.
          </li>
          <li>
            Dans l’annexe 2025, « 0952173w » devient « 0952173W » pour le
            rapprochement. La ligne PDF d’origine reste consultable.
          </li>
          <li>
            Les montants des annexes sont qualifiés de propositions tant que les
            actes adoptés ou notifications ne sont pas rapprochés.
          </li>
        </ul>
      </article>
    </div>
  );
}

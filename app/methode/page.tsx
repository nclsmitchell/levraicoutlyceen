import { Intro, Notice } from "../components";
export default function Method() {
  return (
    <div className="container narrow">
      <Intro
        eyebrow="LA MÉTHODE · VERSION 1"
        title="Comprendre avant de comparer."
      >
        <p>
          Davantage de moyens annoncés se traduit-il par de meilleures
          conditions d’étude ? La réponse reste à établir, lycée par lycée.
        </p>
      </Intro>
      <Notice>
        Cette version ne calcule aucun coût complet. Elle publie des effectifs,
        des décisions d’affectation et des propositions de dotation documentées,
        avec leurs limites.
      </Notice>
      {[
        [
          "Un périmètre commun",
          "Les lycées publics de l’Éducation nationale en Île-de-France constituent le périmètre principal. Les sections, unités rattachées, EREA et autres tutelles sont séparés. Un UAI n’est pas nécessairement un EPLE, un site ou une cité scolaire. Les relations observées aujourd’hui ne sont pas projetées dans le passé. À Paris, la commune 75056 est distinguée des arrondissements.",
        ],
        [
          "Dotation, budget, dépense et coût",
          "Une dotation est un financement destiné à l’établissement. Une autorisation permet d’engager des moyens. Un mandatement net est un ordre de payer, pas un paiement net. Une charge comptable décrit une autre base. Un marché décrit un contrat. Aucun de ces montants ne prouve à lui seul un coût complet. Les propositions de dotation issues de rapports attendent le rapprochement avec les actes adoptés et les notifications.",
        ],
        [
          "Consolider sans double compte",
          "Une dotation et l’achat qu’elle finance ne sont pas deux dépenses finales. Les transferts internes, avances aux mandataires et remplacements déjà inclus sont éliminés lorsque leur lien est documenté. Les annulations et remboursements conservent leur signe. Les décisions multiples d’un même dossier ne sont pas cumulées sans connaître leur articulation. Une acquisition et son amortissement ne sont pas ajoutés dans le même indicateur économique.",
        ],
        [
          "La bonne population, au bon moment",
          "Les effectifs GT et PRO sont affichés séparément par UAI ; aucun total inter-voies n’est publié dans ce MVP. On ne somme jamais les ventilations de sexe ou de langues. Une valeur masquée n’est pas reconstituée. L’exhaustivité BTS/CPGE n’est pas établie. Les coûts incluant ces étudiants, un collège, l’apprentissage ou la formation continue ne peuvent pas être divisés par les seuls élèves des voies affichées.",
        ],
        [
          "Passer de la rentrée à l’année civile",
          "L’effectif moyen administratif est à privilégier. À défaut, pour un périmètre stable et deux valeurs connues : (8 × rentrée N−1 + 4 × rentrée N) / 12. Ce résultat est une estimation, jamais une observation. Si une rentrée manque ou qu’une ouverture, fermeture ou fusion modifie le périmètre, le calcul est bloqué jusqu’à validation.",
        ],
        [
          "Comparer des territoires",
          "Le futur ratio territorial utilisera la somme des dépenses éligibles divisée par les effectifs correspondants ; jamais une moyenne simple des ratios. Sur plusieurs années, le dénominateur sera en élèves-années. Le panel couvert et les exclus seront affichés. Le comparateur actuel propose un panel constant des UAI ayant un effectif publié chaque année. Il utilise la géographie actuelle et ne prétend pas reconstituer les unités historiques.",
        ],
        [
          "Partager les coûts avec une clé justifiée",
          "Affectation directe d’abord, clé administrative documentée ensuite, estimation signalée en dernier recours. Temps de service, compteurs, surfaces, repas ou nuitées dépendent du poste. Somme des allocations et reliquat = montant d’origine. Aucun résiduel n’est distribué automatiquement aux élèves.",
        ],
        [
          "Trois indicateurs distincts",
          "Dépense annuelle exécutée documentée par élève ; coût économique annualisé ; financement public net. Les trois restent bloqués tant que leurs entrées ne sont pas suffisamment documentées. Aucune durée d’amortissement arbitraire. Euros courants par défaut ; euros constants désactivés en attendant un déflateur officiel validé.",
        ],
        [
          "Personnel, pensions et aides",
          "Le périmètre devra expliciter rémunérations, charges employeur, contribution aux pensions et remplacements. Ne pas compter à la fois contribution employeur et pensions versées aux retraités comme deux coûts propres au lycée. Bourses, transports et autres aides restent identifiés séparément.",
        ],
        [
          "Des conditions d’étude documentées",
          "Un diagnostic est daté, localisé et associé à une méthode. Une date prévue n’est pas une livraison réalisée. Une rénovation partielle ne décrit pas tout le lycée. Un montant de travaux ne mesure pas la vétusté ; une dépense de remplacement ne mesure pas les heures assurées. Diagnostics techniques, communication institutionnelle et témoignages restent distincts. Aucun score synthétique ni classement de gestion.",
        ],
        [
          "Qualité et données manquantes",
          "Observé, alloué, estimé, manquant, masqué et sans objet sont des états distincts. Le périmètre est partiel, complet dans son champ déclaré ou non comparable. Aucun pourcentage de coût couvert n’est publié lorsque le coût total est inconnu. Une absence de signalement n’est jamais un bon état présumé.",
        ],
        [
          "Contexte social et limites des séries",
          "L’IPS sert au contexte, sans correction automatique des coûts. Sa méthode change à partir de 2022. Les effectifs PRO incluent des autres formations professionnelles à partir de 2025 : l’évolution de périmètre doit être prise en compte. Les sources CPGE inspectées ne présentent pas une granularité UAI exploitable dans cette version.",
        ],
        [
          "Versions, preuves et corrections",
          "Les octets sources sont archivés sous leur SHA-256. Chaque observation référence une ligne, un champ, une version et une transformation. Les PDF ajoutent page, tableau et colonne. Un nouveau document crée une version, sans écraser l’original. Les imports administratifs sont locaux et contrôlés, jamais publics ou anonymes. Les originaux privés restent séparés des versions publiables expurgées.",
        ],
      ].map(([title, text]) => (
        <section className="method-section" key={title}>
          <h2>{title}</h2>
          <p>{text}</p>
        </section>
      ))}
    </div>
  );
}

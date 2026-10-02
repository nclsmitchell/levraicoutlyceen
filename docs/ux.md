# Modifications UX — 2 octobre 2026

Cette revue porte sur les parcours de l’accueil, de l’annuaire, des fiches et du comparateur, au clavier, sur ordinateur et sur mobile. Elle accompagne les modifications du site existant ; aucun chiffre source ni calcul financier n’a été modifié.

## Problèmes traités

- Les listes de lycées et de communes demandaient de parcourir de nombreuses options. Tous les sélecteurs permettent maintenant de rechercher dans les libellés et les codes, sans tenir compte de la casse ni des accents. Les choix de lycée incluent le nom, la ville et l’UAI. Les flèches parcourent les résultats, Entrée valide un choix et Échap restaure le choix précédent. Une saisie libre ne devient jamais une nouvelle valeur administrative.
- Le choix d’un nouveau département pouvait conserver une commune incompatible. Les communes proposées se mettent maintenant à jour immédiatement ; changer de département ou de catégorie réinitialise la commune. Paris conserve le code communal officiel `75056`.
- Une comparaison ouverte sans période montrait une seule rentrée. La période par défaut couvre désormais 2019–2025. Le formulaire empêche une dernière rentrée antérieure à la première. Un lycée sans observation GT ouvre par défaut la population PRO uniquement si des observations PRO existent ; les deux populations ne sont pas additionnées.
- Le changement de niveau géographique faisait perdre la période choisie. Les liens Départements/Communes/Lycées conservent la période, la population et le mode de suivi. Un message distingue les sélections modifiées des résultats déjà affichés.
- Le partage exigeait de recopier l’adresse. Le bouton « Copier le lien » construit une URL contenant tous les filtres appliqués et confirme la copie. Si le presse-papiers est indisponible, un champ de lien sélectionnable est proposé.
- Les tableaux rendaient l’évolution et la couverture difficiles à lire rapidement. Deux graphiques partagent les données du tableau et de l’export : effectifs publiés et établissements documentés sur l’ensemble sélectionné. Les boutons de rentrée donnent les valeurs exactes au clavier et renvoient à la ligne correspondante du tableau, avec ses preuves et exclusions.
- Les contrôles mobiles étaient petits. Les champs de saisie utilisent 16 px sur mobile, les contrôles de sélection et les boutons de rentrée au moins 44 px. Les listes restent défilables sans débordement de la page ; un texte indique le défilement horizontal des tableaux.

## Règles des graphiques

Les deux sélections utilisent la même échelle, partant de zéro. A emploie des points ronds et un trait continu, B des carrés et un trait discontinu. Les styles et les lettres A/B complètent la couleur. Les valeurs exactes et les sources restent accessibles dans les tableaux.

Une année sans effectif n’est ni un zéro ni un segment interpolé. Une courbe s’interrompt également si les UAI couverts changent entre deux rentrées. La rupture du périmètre des formations PRO en 2025 interdit un segment 2024–2025. Les effectifs d’un panel partiel sont explicitement distingués du total territorial.

La couverture graphique compte les établissements dont l’effectif est documenté. Elle ne prétend mesurer ni la part des élèves couverts lorsque le total manque, ni un pourcentage de coût connu. Aucun graphique ne somme les dotations, les marchés ou les affectations non consolidées ; les dépenses exécutées et les conditions d’étude attendues restent signalées comme manquantes.

## Vérification

```sh
npm run build
npm start
npm run test:ui
npm run test:ux
```

`test:ui` contrôle les 20 écrans de la première version sur ordinateur et mobile. `test:ux` contrôle les recherches par UAI, la casse, les accents, les sélections obligatoires, le clavier, les filtres dépendants, les bornes chronologiques, le partage, l’accord graphique/export et les ruptures sur les données réelles. Le cas d’année masquée utilise le lycée `0750688R`, population PRO. Les rapports datés sont dans `ui-validation.json` et `ux-validation.json`, puis `cloud-ui-validation.json` et `cloud-ux-validation.json` après mise en ligne. Les captures de production sont dans `screenshots-cloud/`.

Les contrôles axe incluent aussi une liste de sélection ouverte et les graphiques. Cette vérification de parcours ne constitue pas une étude auprès d’utilisateurs ni un audit RGAA exhaustif. Le comportement clavier suit le [modèle de combobox éditable WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).

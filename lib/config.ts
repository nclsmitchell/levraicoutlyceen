export const site = {
  name: "Le vrai coût par lycéen",
  subtitle: "Dépenses publiques, moyens et conditions d’étude, lycée par lycée",
  domain: process.env.SITE_DOMAIN || "levraicoutlyceen.fr",
  cloud: process.env.DEPLOYMENT_ENV === "cloudrun",
  question:
    "Davantage de moyens annoncés se traduit-il par de meilleures conditions d’étude ?",
};

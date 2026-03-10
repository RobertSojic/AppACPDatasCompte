/** Constantes de l'application (labels, messages, etc.) */

export const ETAPES = [
  { id: "import" as const, label: "Import", numero: 1 },
  { id: "configuration" as const, label: "Configuration", numero: 2 },
  { id: "visualisation" as const, label: "Visualisation", numero: 3 },
  { id: "resultats" as const, label: "Résultats", numero: 4 },
];

export const MESSAGES = {
  TITRE_APP: "FinMap — Cartographie Factorielle Financière",
  IMPORT_TITRE: "Import des données",
  IMPORT_DESCRIPTION:
    "Chargez un fichier CSV ou Excel contenant les états financiers.",
  IMPORT_DROP: "Glissez-déposez un fichier ici ou cliquez pour sélectionner",
  IMPORT_FORMATS: "Formats acceptés : CSV (.csv) et Excel (.xlsx)",
  CONFIG_TITRE: "Configuration de l'analyse",
  VISU_TITRE: "Cartographie factorielle",
  RESULTATS_TITRE: "Résultats et export",
  ERREUR_CATEGORIES_MIXTES:
    "Les entreprises importées relèvent de catégories bilantaires différentes. L'analyse ne peut pas être réalisée avec des schémas incompatibles.",
  CHARGEMENT: "Chargement en cours...",
  CALCUL_ACP: "Calcul de l'ACP en cours...",
};

/** Types partagés entre le frontend et le backend */

/** Réponse de l'endpoint d'import */
export interface ReponseImport {
  apercu: Record<string, unknown>[];
  colonnes: string[];
  entreprises: { id: string; nom: string; categorie: string }[];
  annees: number[];
  variables: string[];
  alertes: { type: "erreur" | "avertissement"; message: string }[];
  est_valide: boolean;
  total_bilan_colonne: string;
}

/** Configuration envoyée pour le calcul ACP */
export interface RequeteACP {
  cheminFichier: string;
  entreprises: string[];
  annees: number[];
  variables: string[];
  standardisation: boolean;
}

/** Résultats retournés par le calcul ACP */
export interface ReponseACP {
  valeurs_propres: number[];
  variance_expliquee: number[];
  variance_cumulee: number[];
  coordonnees_individus: Record<string, number[]>;
  coordonnees_variables: Record<string, number[]>;
  contributions_individus: Record<string, number[]>;
  contributions_variables: Record<string, number[]>;
  cos2_individus: Record<string, number[]>;
  cos2_variables: Record<string, number[]>;
  noms_individus: string[];
  noms_variables: string[];
}

/** Étape de navigation */
export type Etape = "import" | "configuration" | "visualisation" | "resultats";

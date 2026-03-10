import { create } from "zustand";

/** Résultats de l'ACP */
export interface EtatResultats {
  /** Valeurs propres */
  valeursPropres: number[];
  /** Pourcentage de variance expliquée par axe */
  varianceExpliquee: number[];
  /** Pourcentage cumulé de variance */
  varianceCumulee: number[];
  /** Coordonnées factorielles des individus [nom_individu][axe] */
  coordonneesIndividus: Record<string, number[]> | null;
  /** Coordonnées factorielles des variables [nom_variable][axe] */
  coordonneesVariables: Record<string, number[]> | null;
  /** Contributions des individus (%) */
  contributionsIndividus: Record<string, number[]> | null;
  /** Contributions des variables (%) */
  contributionsVariables: Record<string, number[]> | null;
  /** Cos² des individus */
  cos2Individus: Record<string, number[]> | null;
  /** Cos² des variables */
  cos2Variables: Record<string, number[]> | null;
  /** Axe horizontal sélectionné (index 0-based) */
  axeX: number;
  /** Axe vertical sélectionné (index 0-based) */
  axeY: number;
  /** Année sélectionnée pour le slider (null = toutes) */
  anneeSelectionnee: number | null;
  /** Calcul en cours */
  enCalcul: boolean;
}

interface ActionsResultats {
  setResultats: (resultats: Partial<EtatResultats>) => void;
  setAxeX: (axe: number) => void;
  setAxeY: (axe: number) => void;
  setAnneeSelectionnee: (annee: number | null) => void;
  setEnCalcul: (calcul: boolean) => void;
  reinitialiser: () => void;
}

const etatInitial: EtatResultats = {
  valeursPropres: [],
  varianceExpliquee: [],
  varianceCumulee: [],
  coordonneesIndividus: null,
  coordonneesVariables: null,
  contributionsIndividus: null,
  contributionsVariables: null,
  cos2Individus: null,
  cos2Variables: null,
  axeX: 0,
  axeY: 1,
  anneeSelectionnee: null,
  enCalcul: false,
};

export const useResultatsStore = create<EtatResultats & ActionsResultats>(
  (set) => ({
    ...etatInitial,
    setResultats: (resultats) => set(resultats),
    setAxeX: (axe) => set({ axeX: axe }),
    setAxeY: (axe) => set({ axeY: axe }),
    setAnneeSelectionnee: (annee) => set({ anneeSelectionnee: annee }),
    setEnCalcul: (calcul) => set({ enCalcul: calcul }),
    reinitialiser: () => set(etatInitial),
  })
);

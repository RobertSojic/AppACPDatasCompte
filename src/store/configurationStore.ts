import { create } from "zustand";

/** État de la configuration de l'analyse */
export interface EtatConfiguration {
  /** Entreprises sélectionnées (IDs) */
  entreprisesSelectionnees: string[];
  /** Années sélectionnées */
  anneesSelectionnees: number[];
  /** Variables actives sélectionnées */
  variablesSelectionnees: string[];
  /** Standardisation centrée-réduite activée */
  standardisation: boolean;
}

interface ActionsConfiguration {
  setEntreprisesSelectionnees: (ids: string[]) => void;
  setAnneesSelectionnees: (annees: number[]) => void;
  setVariablesSelectionnees: (variables: string[]) => void;
  setStandardisation: (actif: boolean) => void;
  reinitialiser: () => void;
}

const etatInitial: EtatConfiguration = {
  entreprisesSelectionnees: [],
  anneesSelectionnees: [],
  variablesSelectionnees: [],
  standardisation: true,
};

export const useConfigurationStore = create<
  EtatConfiguration & ActionsConfiguration
>((set) => ({
  ...etatInitial,
  setEntreprisesSelectionnees: (ids) =>
    set({ entreprisesSelectionnees: ids }),
  setAnneesSelectionnees: (annees) =>
    set({ anneesSelectionnees: annees }),
  setVariablesSelectionnees: (variables) =>
    set({ variablesSelectionnees: variables }),
  setStandardisation: (actif) => set({ standardisation: actif }),
  reinitialiser: () => set(etatInitial),
}));

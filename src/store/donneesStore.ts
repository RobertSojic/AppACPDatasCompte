import { create } from "zustand";

/** État des données importées */
export interface EtatDonnees {
  /** Chemin du fichier importé */
  cheminFichier: string | null;
  /** Aperçu des données (10 premières lignes) */
  apercu: Record<string, unknown>[] | null;
  /** Colonnes détectées dans le fichier */
  colonnes: string[];
  /** Entreprises détectées avec leur catégorie bilantaire */
  entreprises: { id: string; nom: string; categorie: string }[];
  /** Années détectées */
  annees: number[];
  /** Alertes de validation */
  alertes: { type: "erreur" | "avertissement"; message: string }[];
  /** Données validées et prêtes pour la configuration */
  estValide: boolean;
  /** Chargement en cours */
  enChargement: boolean;
}

interface ActionsDonnees {
  setCheminFichier: (chemin: string) => void;
  setApercu: (apercu: Record<string, unknown>[]) => void;
  setColonnes: (colonnes: string[]) => void;
  setEntreprises: (
    entreprises: { id: string; nom: string; categorie: string }[]
  ) => void;
  setAnnees: (annees: number[]) => void;
  setAlertes: (
    alertes: { type: "erreur" | "avertissement"; message: string }[]
  ) => void;
  setEstValide: (valide: boolean) => void;
  setEnChargement: (chargement: boolean) => void;
  reinitialiser: () => void;
}

const etatInitial: EtatDonnees = {
  cheminFichier: null,
  apercu: null,
  colonnes: [],
  entreprises: [],
  annees: [],
  alertes: [],
  estValide: false,
  enChargement: false,
};

export const useDonneesStore = create<EtatDonnees & ActionsDonnees>((set) => ({
  ...etatInitial,
  setCheminFichier: (chemin) => set({ cheminFichier: chemin }),
  setApercu: (apercu) => set({ apercu }),
  setColonnes: (colonnes) => set({ colonnes }),
  setEntreprises: (entreprises) => set({ entreprises }),
  setAnnees: (annees) => set({ annees }),
  setAlertes: (alertes) => set({ alertes }),
  setEstValide: (valide) => set({ estValide: valide }),
  setEnChargement: (chargement) => set({ enChargement: chargement }),
  reinitialiser: () => set(etatInitial),
}));

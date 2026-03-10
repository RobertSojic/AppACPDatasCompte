import { useEffect } from "react";
import { MESSAGES } from "../utils/constantes";
import { useDonneesStore } from "../store/donneesStore";
import { useConfigurationStore } from "../store/configurationStore";
import { useResultatsStore } from "../store/resultatsStore";
import { calculerACP } from "../services/api";
import type { ReponseACP } from "../services/types";

interface Props {
  onLancerACP: () => void;
}

/** Écran 2 — Configuration de l'analyse */
export default function EcranConfiguration({ onLancerACP }: Props) {
  const donnees = useDonneesStore();
  const config = useConfigurationStore();
  const resultats = useResultatsStore();

  // Initialiser la sélection avec toutes les entreprises/années/variables
  useEffect(() => {
    if (config.entreprisesSelectionnees.length === 0 && donnees.entreprises.length > 0) {
      config.setEntreprisesSelectionnees(donnees.entreprises.map((e) => e.id));
      config.setAnneesSelectionnees(donnees.annees);
      // Identifier les variables depuis les colonnes (exclure métadonnées)
      const metadonnees = ["Entreprise", "Annee", "Categorie_bilantaire", "Total_bilan"];
      const variables = donnees.colonnes.filter(
        (c) => !metadonnees.includes(c)
      );
      config.setVariablesSelectionnees(variables);
    }
  }, [donnees.entreprises, donnees.annees, donnees.colonnes]);

  /** Nombre d'observations résultantes */
  const nbObservations =
    config.entreprisesSelectionnees.length * config.anneesSelectionnees.length;

  /** Toggle sélection d'un élément dans une liste */
  const toggleSelection = (
    liste: string[],
    element: string,
    setter: (v: string[]) => void
  ) => {
    if (liste.includes(element)) {
      setter(liste.filter((e) => e !== element));
    } else {
      setter([...liste, element]);
    }
  };

  const toggleAnnee = (
    liste: number[],
    annee: number,
    setter: (v: number[]) => void
  ) => {
    if (liste.includes(annee)) {
      setter(liste.filter((a) => a !== annee));
    } else {
      setter([...liste, annee]);
    }
  };

  /** Lancer le calcul ACP */
  const lancerCalcul = async () => {
    if (!donnees.cheminFichier) return;

    resultats.setEnCalcul(true);
    try {
      const reponse = (await calculerACP({
        cheminFichier: donnees.cheminFichier,
        entreprises: config.entreprisesSelectionnees,
        annees: config.anneesSelectionnees,
        variables: config.variablesSelectionnees,
        standardisation: config.standardisation,
      })) as ReponseACP;

      resultats.setResultats({
        valeursPropres: reponse.valeurs_propres,
        varianceExpliquee: reponse.variance_expliquee,
        varianceCumulee: reponse.variance_cumulee,
        coordonneesIndividus: reponse.coordonnees_individus,
        coordonneesVariables: reponse.coordonnees_variables,
        contributionsIndividus: reponse.contributions_individus,
        contributionsVariables: reponse.contributions_variables,
        cos2Individus: reponse.cos2_individus,
        cos2Variables: reponse.cos2_variables,
        axeX: 0,
        axeY: 1,
        anneeSelectionnee: null,
        enCalcul: false,
      });

      onLancerACP();
    } catch (e) {
      console.error("Erreur ACP:", e);
      resultats.setEnCalcul(false);
    }
  };

  const peutLancer =
    config.entreprisesSelectionnees.length >= 2 &&
    config.anneesSelectionnees.length >= 1 &&
    config.variablesSelectionnees.length >= 2 &&
    nbObservations >= 3;

  return (
    <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
      <h2 className="text-2xl font-bold mb-6">{MESSAGES.CONFIG_TITRE}</h2>

      <div className="grid grid-cols-3 gap-6">
        {/* Entreprises */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-700">Entreprises</h3>
            <span className="text-xs text-gray-400">
              {config.entreprisesSelectionnees.length}/{donnees.entreprises.length}
            </span>
          </div>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {donnees.entreprises.map((ent) => (
              <label
                key={ent.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={config.entreprisesSelectionnees.includes(ent.id)}
                  onChange={() =>
                    toggleSelection(
                      config.entreprisesSelectionnees,
                      ent.id,
                      config.setEntreprisesSelectionnees
                    )
                  }
                  className="rounded"
                />
                <span className="text-sm">{ent.nom}</span>
                <span className="text-xs text-gray-400 ml-auto">
                  {ent.categorie}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Années */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-700">Années</h3>
            <span className="text-xs text-gray-400">
              {config.anneesSelectionnees.length}/{donnees.annees.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {donnees.annees.map((annee) => (
              <label
                key={annee}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={config.anneesSelectionnees.includes(annee)}
                  onChange={() =>
                    toggleAnnee(
                      config.anneesSelectionnees,
                      annee,
                      config.setAnneesSelectionnees
                    )
                  }
                  className="rounded"
                />
                <span className="text-sm">{annee}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-700 mb-3">Options</h3>

          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-500">Observations</p>
            <p className="text-3xl font-bold text-blue-600">{nbObservations}</p>
            <p className="text-xs text-gray-400">
              {config.entreprisesSelectionnees.length} entreprises ×{" "}
              {config.anneesSelectionnees.length} années
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.standardisation}
              onChange={(e) => config.setStandardisation(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Données centrées-réduites</span>
          </label>
          <p className="text-xs text-gray-400 ml-6 mt-1">
            Recommandé (défaut FactoMineR)
          </p>
        </div>
      </div>

      {/* Variables actives */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-700">Variables actives (postes comptables)</h3>
          <span className="text-xs text-gray-400">
            {config.variablesSelectionnees.length} sélectionnées
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {donnees.colonnes
            .filter(
              (c) =>
                !["Entreprise", "Annee", "Categorie_bilantaire", "Total_bilan"].includes(c)
            )
            .map((variable) => (
              <label
                key={variable}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
              >
                <input
                  type="checkbox"
                  checked={config.variablesSelectionnees.includes(variable)}
                  onChange={() =>
                    toggleSelection(
                      config.variablesSelectionnees,
                      variable,
                      config.setVariablesSelectionnees
                    )
                  }
                  className="rounded"
                />
                <span className="text-sm">
                  {variable.replace(/_/g, " ")}
                </span>
              </label>
            ))}
        </div>
      </div>

      {/* Bouton lancer */}
      <div className="flex justify-end mt-6">
        <button
          onClick={lancerCalcul}
          disabled={!peutLancer || resultats.enCalcul}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            peutLancer && !resultats.enCalcul
              ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {resultats.enCalcul ? MESSAGES.CALCUL_ACP : "Lancer l'ACP"}
        </button>
      </div>
    </div>
  );
}

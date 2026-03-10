import { useMemo, useState } from "react";
import { useResultatsStore } from "../store/resultatsStore";
import { useDonneesStore } from "../store/donneesStore";
import { couleurEntreprise } from "../utils/couleurs";
import Biplot from "../composants/visualisation/Biplot";
import SliderTemporel from "../composants/visualisation/SliderTemporel";
import SelecteurAxes from "../composants/visualisation/SelecteurAxes";

/** Écran 3 — Biplot interactif */
export default function EcranVisualisation() {
  const resultats = useResultatsStore();
  const donnees = useDonneesStore();
  const [afficherVariables, setAfficherVariables] = useState(true);

  // Extraire les données pour le biplot
  const donneesPlot = useMemo(() => {
    if (!resultats.coordonneesIndividus || !resultats.coordonneesVariables) {
      return null;
    }

    const axeX = resultats.axeX;
    const axeY = resultats.axeY;

    // Mapper les entreprises à des couleurs
    const entreprisesUniques = [...new Set(
      Object.keys(resultats.coordonneesIndividus).map((nom) => {
        const parties = nom.split("_");
        parties.pop(); // Retirer l'année
        return parties.join("_");
      })
    )];

    const couleurMap: Record<string, string> = {};
    entreprisesUniques.forEach((ent, i) => {
      couleurMap[ent] = couleurEntreprise(i);
    });

    // Individus
    const individus = Object.entries(resultats.coordonneesIndividus).map(
      ([nom, coords]) => {
        const parties = nom.split("_");
        const annee = parseInt(parties.pop()!, 10);
        const entreprise = parties.join("_");
        return {
          nom,
          entreprise,
          annee,
          x: coords[axeX],
          y: coords[axeY],
          couleur: couleurMap[entreprise],
        };
      }
    );

    // Variables (vecteurs)
    const variables = Object.entries(resultats.coordonneesVariables).map(
      ([nom, coords]) => ({
        nom,
        x: coords[axeX],
        y: coords[axeY],
      })
    );

    return { individus, variables, entreprisesUniques, couleurMap };
  }, [
    resultats.coordonneesIndividus,
    resultats.coordonneesVariables,
    resultats.axeX,
    resultats.axeY,
  ]);

  // Filtrer par année si le slider est actif
  const individusFiltres = useMemo(() => {
    if (!donneesPlot) return [];
    if (resultats.anneeSelectionnee === null) return donneesPlot.individus;
    return donneesPlot.individus.filter(
      (ind) => ind.annee === resultats.anneeSelectionnee
    );
  }, [donneesPlot, resultats.anneeSelectionnee]);

  if (!donneesPlot) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Aucun résultat ACP disponible
      </div>
    );
  }

  const nbComposantes = resultats.valeursPropres.length;

  return (
    <div className="flex-1 flex flex-col p-4 gap-3">
      {/* Barre d'outils */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-2">
        <div className="flex items-center gap-4">
          <SelecteurAxes
            nbComposantes={nbComposantes}
            varianceExpliquee={resultats.varianceExpliquee}
            axeX={resultats.axeX}
            axeY={resultats.axeY}
            onChangeAxeX={resultats.setAxeX}
            onChangeAxeY={resultats.setAxeY}
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={afficherVariables}
              onChange={(e) => setAfficherVariables(e.target.checked)}
              className="rounded"
            />
            Vecteurs variables
          </label>
          <div className="text-sm text-gray-500">
            Var. cumulée :{" "}
            <span className="font-medium text-gray-800">
              {(
                resultats.varianceExpliquee[resultats.axeX] +
                resultats.varianceExpliquee[resultats.axeY]
              ).toFixed(1)}
              %
            </span>
          </div>
        </div>
      </div>

      {/* Biplot principal */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 min-h-0">
        <Biplot
          individus={individusFiltres}
          variables={afficherVariables ? donneesPlot.variables : []}
          axeX={resultats.axeX}
          axeY={resultats.axeY}
          varianceExpliquee={resultats.varianceExpliquee}
          entreprisesUniques={donneesPlot.entreprisesUniques}
          couleurMap={donneesPlot.couleurMap}
        />
      </div>

      {/* Slider temporel */}
      <SliderTemporel
        annees={donnees.annees}
        anneeSelectionnee={resultats.anneeSelectionnee}
        onChangeAnnee={resultats.setAnneeSelectionnee}
      />
    </div>
  );
}

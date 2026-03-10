import { useState } from "react";
import { MESSAGES } from "../utils/constantes";
import { useResultatsStore } from "../store/resultatsStore";
import ScreePlot from "../composants/visualisation/ScreePlot";

type OngletResultat =
  | "valeurs_propres"
  | "coord_individus"
  | "coord_variables"
  | "contrib_individus"
  | "contrib_variables"
  | "cos2_individus"
  | "cos2_variables";

/** Écran 4 — Résultats et export */
export default function EcranResultats() {
  const resultats = useResultatsStore();
  const [ongletActif, setOngletActif] =
    useState<OngletResultat>("valeurs_propres");

  if (!resultats.coordonneesIndividus) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Aucun résultat disponible. Lancez d'abord l'ACP.
      </div>
    );
  }

  const onglets: { id: OngletResultat; label: string }[] = [
    { id: "valeurs_propres", label: "Valeurs propres" },
    { id: "coord_individus", label: "Coord. individus" },
    { id: "coord_variables", label: "Coord. variables" },
    { id: "contrib_individus", label: "Contrib. individus" },
    { id: "contrib_variables", label: "Contrib. variables" },
    { id: "cos2_individus", label: "Cos² individus" },
    { id: "cos2_variables", label: "Cos² variables" },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 gap-4 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{MESSAGES.RESULTATS_TITRE}</h2>
      </div>

      {/* Scree plot */}
      <div className="bg-white rounded-lg border border-gray-200 p-4" style={{ height: 250 }}>
        <ScreePlot
          valeursPropres={resultats.valeursPropres}
          varianceExpliquee={resultats.varianceExpliquee}
          varianceCumulee={resultats.varianceCumulee}
        />
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b border-gray-200">
        {onglets.map((onglet) => (
          <button
            key={onglet.id}
            onClick={() => setOngletActif(onglet.id)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              ongletActif === onglet.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {onglet.label}
          </button>
        ))}
      </div>

      {/* Contenu de l'onglet */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 min-h-0">
        <div className="overflow-auto h-full">
          {ongletActif === "valeurs_propres" && (
            <TableauVP
              valeursPropres={resultats.valeursPropres}
              varianceExpliquee={resultats.varianceExpliquee}
              varianceCumulee={resultats.varianceCumulee}
            />
          )}
          {ongletActif === "coord_individus" &&
            resultats.coordonneesIndividus && (
              <TableauDonnees
                donnees={resultats.coordonneesIndividus}
                precision={4}
              />
            )}
          {ongletActif === "coord_variables" &&
            resultats.coordonneesVariables && (
              <TableauDonnees
                donnees={resultats.coordonneesVariables}
                precision={4}
              />
            )}
          {ongletActif === "contrib_individus" &&
            resultats.contributionsIndividus && (
              <TableauDonnees
                donnees={resultats.contributionsIndividus}
                precision={2}
                suffixe="%"
              />
            )}
          {ongletActif === "contrib_variables" &&
            resultats.contributionsVariables && (
              <TableauDonnees
                donnees={resultats.contributionsVariables}
                precision={2}
                suffixe="%"
              />
            )}
          {ongletActif === "cos2_individus" && resultats.cos2Individus && (
            <TableauDonnees
              donnees={resultats.cos2Individus}
              precision={4}
            />
          )}
          {ongletActif === "cos2_variables" && resultats.cos2Variables && (
            <TableauDonnees
              donnees={resultats.cos2Variables}
              precision={4}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/** Tableau des valeurs propres */
function TableauVP({
  valeursPropres,
  varianceExpliquee,
  varianceCumulee,
}: {
  valeursPropres: number[];
  varianceExpliquee: number[];
  varianceCumulee: number[];
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50">
          <th className="px-4 py-2 text-left font-medium text-gray-600">
            Composante
          </th>
          <th className="px-4 py-2 text-right font-medium text-gray-600">
            Valeur propre
          </th>
          <th className="px-4 py-2 text-right font-medium text-gray-600">
            Variance (%)
          </th>
          <th className="px-4 py-2 text-right font-medium text-gray-600">
            Cumulé (%)
          </th>
        </tr>
      </thead>
      <tbody>
        {valeursPropres.map((vp, i) => (
          <tr key={i} className="hover:bg-gray-50 border-b border-gray-100">
            <td className="px-4 py-2 font-medium">PC{i + 1}</td>
            <td className="px-4 py-2 text-right font-mono">{vp.toFixed(4)}</td>
            <td className="px-4 py-2 text-right font-mono">
              {varianceExpliquee[i].toFixed(2)}%
            </td>
            <td className="px-4 py-2 text-right font-mono">
              {varianceCumulee[i].toFixed(2)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Tableau générique pour les données ACP (coord, contrib, cos²) */
function TableauDonnees({
  donnees,
  precision,
  suffixe = "",
}: {
  donnees: Record<string, number[]>;
  precision: number;
  suffixe?: string;
}) {
  const noms = Object.keys(donnees);
  if (noms.length === 0) return null;

  const nbAxes = donnees[noms[0]].length;
  // Afficher max 10 axes
  const axesAffiches = Math.min(nbAxes, 10);

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50">
          <th className="px-4 py-2 text-left font-medium text-gray-600 sticky left-0 bg-gray-50">
            Nom
          </th>
          {Array.from({ length: axesAffiches }, (_, i) => (
            <th
              key={i}
              className="px-4 py-2 text-right font-medium text-gray-600"
            >
              PC{i + 1}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {noms.map((nom) => (
          <tr key={nom} className="hover:bg-gray-50 border-b border-gray-100">
            <td className="px-4 py-2 font-medium whitespace-nowrap sticky left-0 bg-white">
              {nom.replace(/_/g, " ")}
            </td>
            {Array.from({ length: axesAffiches }, (_, i) => (
              <td key={i} className="px-4 py-2 text-right font-mono">
                {donnees[nom][i]?.toFixed(precision)}
                {suffixe}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

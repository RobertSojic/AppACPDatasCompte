import { useState, useCallback } from "react";
import { MESSAGES } from "../utils/constantes";
import { useDonneesStore } from "../store/donneesStore";
import { importerFichier } from "../services/api";
import type { ReponseImport } from "../services/types";

interface Props {
  backendPret: boolean;
  onValide: () => void;
}

/** Écran 1 — Import des données */
export default function EcranImport({ backendPret, onValide }: Props) {
  const store = useDonneesStore();
  const [survol, setSurvol] = useState(false);

  /** Traitement du fichier sélectionné */
  const traiterFichier = useCallback(
    async (chemin: string) => {
      store.setEnChargement(true);
      store.setCheminFichier(chemin);

      try {
        const reponse = (await importerFichier(chemin)) as ReponseImport;

        store.setApercu(reponse.apercu);
        store.setColonnes(reponse.colonnes);
        store.setEntreprises(reponse.entreprises);
        store.setAnnees(reponse.annees);
        store.setAlertes(reponse.alertes);
        store.setEstValide(reponse.est_valide);
      } catch (e) {
        store.setAlertes([
          {
            type: "erreur",
            message: `Erreur lors de l'import : ${e instanceof Error ? e.message : String(e)}`,
          },
        ]);
        store.setEstValide(false);
      } finally {
        store.setEnChargement(false);
      }
    },
    [store]
  );

  /** Sélection de fichier via input natif */
  const onSelectionFichier = async () => {
    // En mode Tauri, utiliser le dialog natif
    if ("__TAURI_INTERNALS__" in window) {
      try {
        const { open } = await import("@tauri-apps/plugin-dialog");
        const chemin = await open({
          filters: [
            { name: "Données financières", extensions: ["csv", "xlsx"] },
          ],
        });
        if (chemin) await traiterFichier(chemin as string);
      } catch (e) {
        console.error("Erreur dialog:", e);
      }
    } else {
      // Mode navigateur : input file classique
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".csv,.xlsx";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          // En mode dev, on utilise un chemin absolu connu
          // On envoie le nom du fichier, le backend cherchera dans donnees-test/
          await traiterFichier(file.name);
        }
      };
      input.click();
    }
  };

  /** Drag & drop */
  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setSurvol(false);
      const fichier = e.dataTransfer.files[0];
      if (fichier) {
        // En mode Tauri, on récupère le chemin natif
        if ("__TAURI_INTERNALS__" in window) {
          // Tauri fournit le chemin via dataTransfer
          const chemin = (e.dataTransfer as unknown as { paths?: string[] })
            .paths?.[0];
          if (chemin) await traiterFichier(chemin);
        } else {
          await traiterFichier(fichier.name);
        }
      }
    },
    [traiterFichier]
  );

  return (
    <div className="flex-1 flex flex-col p-8 gap-6 max-w-6xl mx-auto w-full">
      <div>
        <h2 className="text-2xl font-bold">{MESSAGES.IMPORT_TITRE}</h2>
        <p className="text-gray-500 mt-1">{MESSAGES.IMPORT_DESCRIPTION}</p>
      </div>

      {/* Zone de drop */}
      <div
        onClick={backendPret ? onSelectionFichier : undefined}
        onDragOver={(e) => {
          e.preventDefault();
          setSurvol(true);
        }}
        onDragLeave={() => setSurvol(false)}
        onDrop={backendPret ? onDrop : undefined}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          !backendPret
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : survol
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
        }`}
      >
        {store.enChargement ? (
          <p className="text-blue-600 font-medium">{MESSAGES.CHARGEMENT}</p>
        ) : (
          <>
            <p className="text-gray-600 font-medium">
              {backendPret
                ? MESSAGES.IMPORT_DROP
                : "En attente du backend..."}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {MESSAGES.IMPORT_FORMATS}
            </p>
            {store.cheminFichier && (
              <p className="text-sm text-blue-600 mt-2">
                Fichier actuel : {store.cheminFichier}
              </p>
            )}
          </>
        )}
      </div>

      {/* Alertes de validation */}
      {store.alertes.length > 0 && (
        <div className="flex flex-col gap-2">
          {store.alertes.map((alerte, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg text-sm ${
                alerte.type === "erreur"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-yellow-50 text-yellow-800 border border-yellow-200"
              }`}
            >
              <span className="font-medium">
                {alerte.type === "erreur" ? "Erreur : " : "Avertissement : "}
              </span>
              {alerte.message}
            </div>
          ))}
        </div>
      )}

      {/* Métadonnées détectées */}
      {store.entreprises.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Entreprises</p>
            <p className="text-2xl font-bold text-gray-800">
              {store.entreprises.length}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {store.entreprises.map((e) => e.nom).join(", ")}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Années</p>
            <p className="text-2xl font-bold text-gray-800">
              {store.annees.length}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {store.annees.join(", ")}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">Catégorie bilantaire</p>
            <p className="text-2xl font-bold text-gray-800">
              {store.entreprises[0]?.categorie || "—"}
            </p>
          </div>
        </div>
      )}

      {/* Aperçu des données */}
      {store.apercu && store.apercu.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium text-gray-700">
              Aperçu des données ({store.apercu.length} premières lignes)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {store.colonnes.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left font-medium text-gray-600 border-b whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {store.apercu.map((ligne, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {store.colonnes.map((col) => (
                      <td
                        key={col}
                        className="px-3 py-2 border-b border-gray-100 whitespace-nowrap"
                      >
                        {String(ligne[col] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bouton continuer */}
      {store.estValide && (
        <div className="flex justify-end">
          <button
            onClick={onValide}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Valider et continuer
          </button>
        </div>
      )}
    </div>
  );
}

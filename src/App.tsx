import { useState, useEffect } from "react";
import NavigationEtapes from "./composants/communs/NavigationEtapes";
import EcranImport from "./ecrans/EcranImport";
import EcranConfiguration from "./ecrans/EcranConfiguration";
import EcranVisualisation from "./ecrans/EcranVisualisation";
import EcranResultats from "./ecrans/EcranResultats";
import type { Etape } from "./services/types";
import { MESSAGES } from "./utils/constantes";
import { initialiserBackend } from "./services/backend";

function App() {
  const [etapeActive, setEtapeActive] = useState<Etape>("import");
  const [etapesAccessibles, setEtapesAccessibles] = useState<Etape[]>([
    "import",
  ]);
  const [backendPret, setBackendPret] = useState(false);
  const [erreurBackend, setErreurBackend] = useState(false);

  // Initialiser la connexion au backend au démarrage
  useEffect(() => {
    initialiserBackend().then((ok) => {
      setBackendPret(ok);
      if (!ok) setErreurBackend(true);
    });
  }, []);

  /** Passer à une étape et la rendre accessible */
  const allerEtape = (etape: Etape) => {
    setEtapeActive(etape);
    if (!etapesAccessibles.includes(etape)) {
      setEtapesAccessibles((prev) => [...prev, etape]);
    }
  };

  /** Débloquer une étape sans y naviguer */
  const debloquerEtape = (etape: Etape) => {
    if (!etapesAccessibles.includes(etape)) {
      setEtapesAccessibles((prev) => [...prev, etape]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">
          {MESSAGES.TITRE_APP}
        </h1>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${backendPret ? "bg-green-500" : erreurBackend ? "bg-red-500" : "bg-yellow-500 animate-pulse"}`}
          />
          <span className="text-xs text-gray-500">
            {backendPret
              ? "Backend connecté"
              : erreurBackend
                ? "Backend non disponible"
                : "Connexion..."}
          </span>
        </div>
      </header>

      {/* Navigation par étapes */}
      <NavigationEtapes
        etapeActive={etapeActive}
        onChangerEtape={allerEtape}
        etapesAccessibles={etapesAccessibles}
      />

      {/* Contenu de l'écran actif */}
      <main className="flex-1 flex overflow-auto">
        {etapeActive === "import" && (
          <EcranImport
            backendPret={backendPret}
            onValide={() => {
              debloquerEtape("configuration");
              allerEtape("configuration");
            }}
          />
        )}
        {etapeActive === "configuration" && (
          <EcranConfiguration
            onLancerACP={() => {
              debloquerEtape("visualisation");
              debloquerEtape("resultats");
              allerEtape("visualisation");
            }}
          />
        )}
        {etapeActive === "visualisation" && <EcranVisualisation />}
        {etapeActive === "resultats" && <EcranResultats />}
      </main>
    </div>
  );
}

export default App;

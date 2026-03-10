import { ETAPES } from "../../utils/constantes";
import type { Etape } from "../../services/types";

interface Props {
  etapeActive: Etape;
  onChangerEtape: (etape: Etape) => void;
  etapesAccessibles: Etape[];
}

/** Barre de navigation par étapes (stepper) */
export default function NavigationEtapes({
  etapeActive,
  onChangerEtape,
  etapesAccessibles,
}: Props) {
  return (
    <nav className="flex items-center justify-center gap-2 py-4 px-6 bg-white border-b border-gray-200">
      {ETAPES.map((etape, index) => {
        const estActive = etape.id === etapeActive;
        const estAccessible = etapesAccessibles.includes(etape.id);

        return (
          <div key={etape.id} className="flex items-center">
            {index > 0 && (
              <div
                className={`w-12 h-0.5 mx-2 ${
                  estAccessible ? "bg-blue-400" : "bg-gray-200"
                }`}
              />
            )}
            <button
              onClick={() => estAccessible && onChangerEtape(etape.id)}
              disabled={!estAccessible}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                estActive
                  ? "bg-blue-600 text-white"
                  : estAccessible
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  estActive
                    ? "bg-white text-blue-600"
                    : estAccessible
                      ? "bg-blue-200 text-blue-700"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                {etape.numero}
              </span>
              {etape.label}
            </button>
          </div>
        );
      })}
    </nav>
  );
}

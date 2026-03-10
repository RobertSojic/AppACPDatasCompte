import { useState, useRef, useCallback, useEffect } from "react";

interface Props {
  annees: number[];
  anneeSelectionnee: number | null;
  onChangeAnnee: (annee: number | null) => void;
}

/** Slider temporel avec bouton play/pause pour animer par année */
export default function SliderTemporel({
  annees,
  anneeSelectionnee,
  onChangeAnnee,
}: Props) {
  const [enLecture, setEnLecture] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Arrêter l'animation */
  const arreter = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setEnLecture(false);
  }, []);

  /** Lancer l'animation */
  const lancer = useCallback(() => {
    setEnLecture(true);
    indexRef.current = 0;
    onChangeAnnee(annees[0]);

    intervalRef.current = setInterval(() => {
      indexRef.current++;
      if (indexRef.current >= annees.length) {
        // Revenir à "toutes les années" à la fin
        onChangeAnnee(null);
        arreter();
      } else {
        onChangeAnnee(annees[indexRef.current]);
      }
    }, 1500);
  }, [annees, onChangeAnnee, arreter]);

  // Nettoyage à la destruction
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (annees.length <= 1) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-4">
      {/* Bouton play/pause */}
      <button
        onClick={enLecture ? arreter : lancer}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
        title={enLecture ? "Pause" : "Lecture"}
      >
        {enLecture ? (
          <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
            <rect x="1" y="0" width="3" height="14" />
            <rect x="8" y="0" width="3" height="14" />
          </svg>
        ) : (
          <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
            <polygon points="0,0 12,7 0,14" />
          </svg>
        )}
      </button>

      {/* Boutons d'années */}
      <div className="flex items-center gap-1 flex-1">
        <button
          onClick={() => onChangeAnnee(null)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
            anneeSelectionnee === null
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Toutes
        </button>
        {annees.map((annee) => (
          <button
            key={annee}
            onClick={() => onChangeAnnee(annee)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
              anneeSelectionnee === annee
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {annee}
          </button>
        ))}
      </div>

      {/* Label */}
      <span className="text-sm text-gray-500">
        {anneeSelectionnee
          ? `Année ${anneeSelectionnee}`
          : "Toutes les années"}
      </span>
    </div>
  );
}

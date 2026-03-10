interface Props {
  nbComposantes: number;
  varianceExpliquee: number[];
  axeX: number;
  axeY: number;
  onChangeAxeX: (axe: number) => void;
  onChangeAxeY: (axe: number) => void;
}

/** Sélecteur d'axes factoriels (dropdown PC1 vs PC2, etc.) */
export default function SelecteurAxes({
  nbComposantes,
  varianceExpliquee,
  axeX,
  axeY,
  onChangeAxeX,
  onChangeAxeY,
}: Props) {
  // Limiter aux 5 premières composantes pour la lisibilité
  const composantes = Array.from(
    { length: Math.min(nbComposantes, 5) },
    (_, i) => i
  );

  return (
    <div className="flex items-center gap-3 text-sm">
      <label className="flex items-center gap-1">
        <span className="text-gray-500">Axe H :</span>
        <select
          value={axeX}
          onChange={(e) => onChangeAxeX(parseInt(e.target.value, 10))}
          className="border border-gray-200 rounded px-2 py-1 text-sm bg-white"
        >
          {composantes.map((i) => (
            <option key={i} value={i}>
              PC{i + 1} ({varianceExpliquee[i]?.toFixed(1)}%)
            </option>
          ))}
        </select>
      </label>

      <span className="text-gray-300">vs</span>

      <label className="flex items-center gap-1">
        <span className="text-gray-500">Axe V :</span>
        <select
          value={axeY}
          onChange={(e) => onChangeAxeY(parseInt(e.target.value, 10))}
          className="border border-gray-200 rounded px-2 py-1 text-sm bg-white"
        >
          {composantes.map((i) => (
            <option key={i} value={i}>
              PC{i + 1} ({varianceExpliquee[i]?.toFixed(1)}%)
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

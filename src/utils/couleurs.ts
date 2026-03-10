/** Palette de couleurs pour distinguer les entreprises sur le biplot */

const PALETTE = [
  "#2563eb", // bleu
  "#dc2626", // rouge
  "#16a34a", // vert
  "#d97706", // orange
  "#7c3aed", // violet
  "#0891b2", // cyan
  "#e11d48", // rose
  "#65a30d", // lime
  "#0d9488", // teal
  "#c026d3", // fuchsia
  "#ea580c", // orange foncé
  "#4f46e5", // indigo
];

/** Retourne une couleur pour l'entreprise à l'index donné */
export function couleurEntreprise(index: number): string {
  return PALETTE[index % PALETTE.length];
}

export { PALETTE };

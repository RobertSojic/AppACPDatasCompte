import { useMemo } from "react";
import Plot from "react-plotly.js";

interface Individu {
  nom: string;
  entreprise: string;
  annee: number;
  x: number;
  y: number;
  couleur: string;
}

interface Variable {
  nom: string;
  x: number;
  y: number;
}

interface Props {
  individus: Individu[];
  variables: Variable[];
  axeX: number;
  axeY: number;
  varianceExpliquee: number[];
  entreprisesUniques: string[];
  couleurMap: Record<string, string>;
}

/** Composant biplot ACP interactif (Plotly.js) */
export default function Biplot({
  individus,
  variables,
  axeX,
  axeY,
  varianceExpliquee,
  entreprisesUniques,
  couleurMap,
}: Props) {
  const { traces, annotations, maxRange } = useMemo(() => {
    // Traces : une par entreprise pour la légende
    const tracesParEntreprise = entreprisesUniques.map((entreprise) => {
      const points = individus.filter((ind) => ind.entreprise === entreprise);
      return {
        type: "scatter" as const,
        mode: "text+markers" as const,
        name: entreprise.replace(/_/g, " "),
        x: points.map((p) => p.x),
        y: points.map((p) => p.y),
        text: points.map((p) => String(p.annee)),
        textposition: "top center" as const,
        textfont: { size: 10, color: couleurMap[entreprise] },
        marker: {
          size: 10,
          color: couleurMap[entreprise],
          opacity: 0.85,
          line: { width: 1, color: "white" },
        },
        hovertemplate: points.map(
          (p) =>
            `<b>${p.entreprise.replace(/_/g, " ")}</b> (${p.annee})<br>` +
            `PC${axeX + 1}: ${p.x.toFixed(3)}<br>` +
            `PC${axeY + 1}: ${p.y.toFixed(3)}<extra></extra>`
        ),
      };
    });

    // Calculer la plage max pour les axes (individus + variables)
    let maxVal = 1;
    individus.forEach((p) => {
      maxVal = Math.max(maxVal, Math.abs(p.x), Math.abs(p.y));
    });
    // Facteur d'échelle pour les variables (flèches dans le même espace)
    const maxVarLen = Math.max(
      ...variables.map((v) => Math.sqrt(v.x ** 2 + v.y ** 2)),
      0.01
    );
    const echelle = (maxVal * 0.8) / maxVarLen;

    // Annotations (flèches) pour les variables
    const annots = variables.map((v) => ({
      x: v.x * echelle,
      y: v.y * echelle,
      xref: "x" as const,
      yref: "y" as const,
      ax: 0,
      ay: 0,
      axref: "x" as const,
      ayref: "y" as const,
      arrowhead: 3,
      arrowsize: 1.2,
      arrowwidth: 1.5,
      arrowcolor: "#6b7280",
      text: v.nom.replace(/_/g, " "),
      font: { size: 9, color: "#374151" },
      showarrow: true,
    }));

    return {
      traces: tracesParEntreprise,
      annotations: annots,
      maxRange: maxVal * 1.2,
    };
  }, [individus, variables, axeX, axeY, entreprisesUniques, couleurMap]);

  return (
    <Plot
      data={traces}
      layout={{
        autosize: true,
        margin: { l: 60, r: 30, t: 30, b: 60 },
        xaxis: {
          title: `PC${axeX + 1} (${varianceExpliquee[axeX]?.toFixed(1)}%)`,
          zeroline: true,
          zerolinecolor: "#d1d5db",
          zerolinewidth: 1,
          gridcolor: "#f3f4f6",
          range: [-maxRange, maxRange],
        },
        yaxis: {
          title: `PC${axeY + 1} (${varianceExpliquee[axeY]?.toFixed(1)}%)`,
          zeroline: true,
          zerolinecolor: "#d1d5db",
          zerolinewidth: 1,
          gridcolor: "#f3f4f6",
          range: [-maxRange, maxRange],
          scaleanchor: "x",
          scaleratio: 1,
        },
        annotations,
        showlegend: true,
        legend: {
          x: 1,
          y: 1,
          bgcolor: "rgba(255,255,255,0.9)",
          bordercolor: "#e5e7eb",
          borderwidth: 1,
        },
        plot_bgcolor: "white",
        paper_bgcolor: "white",
        dragmode: "pan",
      }}
      config={{
        responsive: true,
        scrollZoom: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ["lasso2d", "select2d"],
        toImageButtonOptions: {
          format: "png",
          filename: "finmap_biplot",
          scale: 2,
        },
        displaylogo: false,
      }}
      useResizeHandler
      style={{ width: "100%", height: "100%" }}
    />
  );
}

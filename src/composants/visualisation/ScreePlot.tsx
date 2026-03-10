import Plot from "react-plotly.js";

interface Props {
  valeursPropres: number[];
  varianceExpliquee: number[];
  varianceCumulee: number[];
}

/** Diagramme des valeurs propres (scree plot) */
export default function ScreePlot({
  valeursPropres,
  varianceExpliquee,
  varianceCumulee,
}: Props) {
  // Afficher max 10 composantes
  const nb = Math.min(valeursPropres.length, 10);
  const labels = Array.from({ length: nb }, (_, i) => `PC${i + 1}`);

  return (
    <Plot
      data={[
        // Barres : variance expliquée
        {
          type: "bar",
          x: labels,
          y: varianceExpliquee.slice(0, nb),
          name: "Variance (%)",
          marker: { color: "#3b82f6", opacity: 0.7 },
          hovertemplate:
            "%{x}<br>Variance: %{y:.2f}%<br>VP: %{customdata:.4f}<extra></extra>",
          customdata: valeursPropres.slice(0, nb),
        },
        // Ligne : variance cumulée
        {
          type: "scatter",
          mode: "lines+markers",
          x: labels,
          y: varianceCumulee.slice(0, nb),
          name: "Cumulé (%)",
          yaxis: "y2",
          line: { color: "#ef4444", width: 2 },
          marker: { size: 6, color: "#ef4444" },
          hovertemplate: "%{x}<br>Cumulé: %{y:.2f}%<extra></extra>",
        },
      ]}
      layout={{
        autosize: true,
        margin: { l: 50, r: 50, t: 10, b: 40 },
        yaxis: {
          title: "Variance expliquée (%)",
          rangemode: "tozero",
          gridcolor: "#f3f4f6",
        },
        yaxis2: {
          title: "Cumulé (%)",
          overlaying: "y",
          side: "right",
          range: [0, 105],
          gridcolor: "transparent",
        },
        showlegend: true,
        legend: { x: 0.7, y: 0.5 },
        plot_bgcolor: "white",
        paper_bgcolor: "white",
        bargap: 0.3,
      }}
      config={{ responsive: true, displayModeBar: false }}
      useResizeHandler
      style={{ width: "100%", height: "100%" }}
    />
  );
}

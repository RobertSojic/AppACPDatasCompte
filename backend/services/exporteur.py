"""Module d'export des résultats (CSV/XLSX)."""

import pandas as pd
from .moteur_acp import ResultatsACP


def exporter_resultats(
    resultats: ResultatsACP,
    chemin_sortie: str,
    format_export: str = "xlsx",
) -> str:
    """
    Exporte les résultats de l'ACP dans un fichier CSV ou XLSX.

    Paramètres:
        resultats: Objet ResultatsACP contenant tous les résultats.
        chemin_sortie: Chemin du fichier de sortie.
        format_export: "csv" ou "xlsx".

    Retourne:
        Chemin du fichier créé.
    """
    if format_export == "xlsx":
        return _exporter_xlsx(resultats, chemin_sortie)
    elif format_export == "csv":
        return _exporter_csv(resultats, chemin_sortie)
    else:
        raise ValueError(f"Format d'export non supporté : {format_export}")


def _construire_tableau_valeurs_propres(resultats: ResultatsACP) -> pd.DataFrame:
    """Construit le tableau des valeurs propres."""
    import numpy as np
    variance_cumulee = np.cumsum(resultats.variance_expliquee)
    return pd.DataFrame({
        "Composante": [f"PC{i+1}" for i in range(resultats.nb_composantes)],
        "Valeur_propre": resultats.valeurs_propres,
        "Variance_expliquee_%": resultats.variance_expliquee,
        "Variance_cumulee_%": variance_cumulee,
    })


def _exporter_xlsx(resultats: ResultatsACP, chemin: str) -> str:
    """Export au format Excel avec un onglet par tableau."""
    with pd.ExcelWriter(chemin, engine="openpyxl") as writer:
        _construire_tableau_valeurs_propres(resultats).to_excel(
            writer, sheet_name="Valeurs propres", index=False
        )
        resultats.coord_individus.to_excel(
            writer, sheet_name="Coord individus"
        )
        resultats.coord_variables.to_excel(
            writer, sheet_name="Coord variables"
        )
        resultats.contrib_individus.to_excel(
            writer, sheet_name="Contrib individus"
        )
        resultats.contrib_variables.to_excel(
            writer, sheet_name="Contrib variables"
        )
        resultats.cos2_individus.to_excel(
            writer, sheet_name="Cos2 individus"
        )
        resultats.cos2_variables.to_excel(
            writer, sheet_name="Cos2 variables"
        )
    return chemin


def _exporter_csv(resultats: ResultatsACP, chemin: str) -> str:
    """Export au format CSV (un seul fichier avec séparateurs de sections)."""
    sections = []

    sections.append("### Valeurs propres ###")
    sections.append(
        _construire_tableau_valeurs_propres(resultats).to_csv(
            index=False, sep=";"
        )
    )

    sections.append("### Coordonnées factorielles — Individus ###")
    sections.append(resultats.coord_individus.to_csv(sep=";"))

    sections.append("### Coordonnées factorielles — Variables ###")
    sections.append(resultats.coord_variables.to_csv(sep=";"))

    sections.append("### Contributions — Individus (%) ###")
    sections.append(resultats.contrib_individus.to_csv(sep=";"))

    sections.append("### Contributions — Variables (%) ###")
    sections.append(resultats.contrib_variables.to_csv(sep=";"))

    sections.append("### Cos² — Individus ###")
    sections.append(resultats.cos2_individus.to_csv(sep=";"))

    sections.append("### Cos² — Variables ###")
    sections.append(resultats.cos2_variables.to_csv(sep=";"))

    with open(chemin, "w", encoding="utf-8") as f:
        f.write("\n".join(sections))

    return chemin

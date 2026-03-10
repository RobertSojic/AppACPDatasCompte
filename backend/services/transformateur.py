"""
Module de transformation des postes comptables en % du total bilan.
Construit la matrice d'analyse empilée (entreprises × années).
"""

import pandas as pd
from .validateur import (
    COLONNE_ENTREPRISE,
    COLONNE_ANNEE,
    COLONNE_TOTAL_BILAN,
    identifier_colonnes_postes,
)


def transformer_en_pourcentages(
    df: pd.DataFrame,
    colonnes_postes: list[str] | None = None,
) -> pd.DataFrame:
    """
    Transforme les postes comptables en pourcentage du total bilan.

    Paramètres:
        df: DataFrame avec les données brutes.
        colonnes_postes: Liste des colonnes à transformer.
            Si None, détecté automatiquement.

    Retourne:
        DataFrame avec les valeurs en pourcentage du total bilan.
    """
    if colonnes_postes is None:
        colonnes_postes = identifier_colonnes_postes(df)

    df_result = df.copy()

    for col in colonnes_postes:
        df_result[col] = (df[col] / df[COLONNE_TOTAL_BILAN]) * 100

    return df_result


def construire_matrice_acp(
    df: pd.DataFrame,
    entreprises: list[str],
    annees: list[int],
    variables: list[str],
) -> tuple[pd.DataFrame, list[str], list[str], list[int]]:
    """
    Construit la matrice d'entrée de l'ACP à partir des données en pourcentages.

    Paramètres:
        df: DataFrame avec les données en pourcentages.
        entreprises: Liste des entreprises à inclure.
        annees: Liste des années à inclure.
        variables: Liste des variables (postes comptables) à inclure.

    Retourne:
        (matrice, noms_individus, noms_entreprises, noms_annees)
        - matrice: DataFrame (observations × variables)
        - noms_individus: Labels "Entreprise_Annee" pour chaque ligne
        - noms_entreprises: Entreprise correspondant à chaque ligne
        - noms_annees: Année correspondant à chaque ligne
    """
    # Filtrer
    masque = (
        df[COLONNE_ENTREPRISE].isin(entreprises) &
        df[COLONNE_ANNEE].isin(annees)
    )
    df_filtre = df[masque].copy()

    # Trier par entreprise puis année
    df_filtre = df_filtre.sort_values(
        [COLONNE_ENTREPRISE, COLONNE_ANNEE]
    ).reset_index(drop=True)

    # Labels des individus : "Entreprise_Annee"
    noms_individus = [
        f"{row[COLONNE_ENTREPRISE]}_{row[COLONNE_ANNEE]}"
        for _, row in df_filtre.iterrows()
    ]
    noms_entreprises = df_filtre[COLONNE_ENTREPRISE].tolist()
    noms_annees = df_filtre[COLONNE_ANNEE].tolist()

    # Extraire la matrice numérique
    matrice = df_filtre[variables].copy()
    matrice.index = noms_individus

    return matrice, noms_individus, noms_entreprises, noms_annees

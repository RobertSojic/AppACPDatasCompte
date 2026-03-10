"""
Module de validation de l'homogénéité bilantaire.
Vérifie que toutes les entreprises relèvent du même schéma comptable
et que les colonnes obligatoires sont présentes.
"""

import pandas as pd

# Colonnes obligatoires
COLONNE_ENTREPRISE = "Entreprise"
COLONNE_ANNEE = "Annee"
COLONNE_CATEGORIE = "Categorie_bilantaire"
COLONNE_TOTAL_BILAN = "Total_bilan"

COLONNES_OBLIGATOIRES = [
    COLONNE_ENTREPRISE,
    COLONNE_ANNEE,
    COLONNE_CATEGORIE,
    COLONNE_TOTAL_BILAN,
]


def valider_colonnes(df: pd.DataFrame) -> list[dict]:
    """
    Vérifie la présence des colonnes obligatoires.

    Retourne:
        Liste d'alertes (type + message).
    """
    alertes = []
    for col in COLONNES_OBLIGATOIRES:
        if col not in df.columns:
            alertes.append({
                "type": "erreur",
                "message": f"Colonne obligatoire manquante : '{col}'",
            })
    return alertes


def valider_homogeneite_bilantaire(df: pd.DataFrame) -> list[dict]:
    """
    Vérifie que toutes les entreprises-années ont la même catégorie bilantaire.

    Retourne:
        Liste d'alertes. Si des catégories mixtes sont détectées,
        une erreur bloquante est retournée avec le détail.
    """
    alertes = []

    if COLONNE_CATEGORIE not in df.columns:
        return alertes  # Erreur déjà signalée par valider_colonnes

    categories = df[COLONNE_CATEGORIE].unique()

    if len(categories) > 1:
        # Détail par entreprise
        detail_par_entreprise = (
            df.groupby(COLONNE_ENTREPRISE)[COLONNE_CATEGORIE]
            .first()
            .to_dict()
        )
        detail = ", ".join(
            f"{nom}: {cat}" for nom, cat in detail_par_entreprise.items()
        )
        alertes.append({
            "type": "erreur",
            "message": (
                f"Catégories bilantaires hétérogènes détectées : "
                f"{list(categories)}. Détail : {detail}. "
                f"Toutes les entreprises doivent relever du même schéma comptable."
            ),
        })

    return alertes


def valider_donnees_numeriques(df: pd.DataFrame) -> list[dict]:
    """Vérifie que les postes comptables sont numériques et non négatifs."""
    alertes = []
    colonnes_postes = identifier_colonnes_postes(df)

    for col in colonnes_postes:
        if not pd.api.types.is_numeric_dtype(df[col]):
            alertes.append({
                "type": "erreur",
                "message": f"La colonne '{col}' contient des valeurs non numériques.",
            })
            continue

        nb_manquants = df[col].isna().sum()
        if nb_manquants > 0:
            alertes.append({
                "type": "avertissement",
                "message": (
                    f"La colonne '{col}' contient "
                    f"{nb_manquants} valeur(s) manquante(s)."
                ),
            })

    return alertes


def valider_total_bilan(df: pd.DataFrame) -> list[dict]:
    """Vérifie que le total bilan est positif pour chaque observation."""
    alertes = []

    if COLONNE_TOTAL_BILAN not in df.columns:
        return alertes

    invalides = df[df[COLONNE_TOTAL_BILAN] <= 0]
    if len(invalides) > 0:
        alertes.append({
            "type": "erreur",
            "message": (
                f"{len(invalides)} observation(s) ont un total bilan "
                f"nul ou négatif."
            ),
        })

    return alertes


def identifier_colonnes_postes(df: pd.DataFrame) -> list[str]:
    """
    Identifie les colonnes de postes comptables (toutes les colonnes
    numériques sauf Annee et Total_bilan).
    """
    colonnes_exclues = set(COLONNES_OBLIGATOIRES)
    postes = []
    for col in df.columns:
        if col in colonnes_exclues:
            continue
        if pd.api.types.is_numeric_dtype(df[col]):
            postes.append(col)
    return postes


def valider(df: pd.DataFrame) -> tuple[list[dict], bool]:
    """
    Exécute toutes les validations sur le DataFrame.

    Retourne:
        (alertes, est_valide) — est_valide est False si au moins
        une alerte de type "erreur" est présente.
    """
    alertes = []
    alertes.extend(valider_colonnes(df))
    alertes.extend(valider_homogeneite_bilantaire(df))
    alertes.extend(valider_donnees_numeriques(df))
    alertes.extend(valider_total_bilan(df))

    est_valide = not any(a["type"] == "erreur" for a in alertes)
    return alertes, est_valide


def extraire_entreprises(df: pd.DataFrame) -> list[dict]:
    """Extrait la liste des entreprises avec leur catégorie bilantaire."""
    if COLONNE_ENTREPRISE not in df.columns:
        return []

    entreprises = (
        df.groupby(COLONNE_ENTREPRISE)[COLONNE_CATEGORIE]
        .first()
        .reset_index()
    )
    return [
        {
            "id": row[COLONNE_ENTREPRISE],
            "nom": row[COLONNE_ENTREPRISE],
            "categorie": row.get(COLONNE_CATEGORIE, "inconnue"),
        }
        for _, row in entreprises.iterrows()
    ]


def extraire_annees(df: pd.DataFrame) -> list[int]:
    """Extrait la liste triée des années présentes."""
    if COLONNE_ANNEE not in df.columns:
        return []
    return sorted(df[COLONNE_ANNEE].unique().tolist())

"""
Module de lecture des fichiers CSV et XLSX.
Détecte automatiquement l'encodage et le séparateur CSV.
"""

import os
import chardet
import pandas as pd


def detecter_encodage(chemin: str) -> str:
    """Détecte l'encodage d'un fichier texte."""
    with open(chemin, "rb") as f:
        resultat = chardet.detect(f.read(10_000))
    return resultat.get("encoding", "utf-8") or "utf-8"


def detecter_separateur(chemin: str, encodage: str) -> str:
    """Détecte le séparateur d'un fichier CSV (virgule ou point-virgule)."""
    with open(chemin, "r", encoding=encodage) as f:
        premiere_ligne = f.readline()
    nb_pointvirgule = premiere_ligne.count(";")
    nb_virgule = premiere_ligne.count(",")
    return ";" if nb_pointvirgule >= nb_virgule else ","


def lire_fichier(chemin: str) -> pd.DataFrame:
    """
    Lit un fichier CSV ou XLSX et retourne un DataFrame.

    Paramètres:
        chemin: Chemin absolu vers le fichier.

    Retourne:
        DataFrame contenant les données du fichier.

    Lève:
        ValueError: Si le format de fichier n'est pas supporté.
        FileNotFoundError: Si le fichier n'existe pas.
    """
    if not os.path.exists(chemin):
        raise FileNotFoundError(f"Fichier introuvable : {chemin}")

    extension = os.path.splitext(chemin)[1].lower()

    if extension == ".csv":
        encodage = detecter_encodage(chemin)
        separateur = detecter_separateur(chemin, encodage)
        df = pd.read_csv(chemin, encoding=encodage, sep=separateur)
    elif extension in (".xlsx", ".xls"):
        df = pd.read_excel(chemin)
    else:
        raise ValueError(
            f"Format non supporté : {extension}. "
            "Formats acceptés : .csv, .xlsx, .xls"
        )

    return df


def extraire_apercu(df: pd.DataFrame, nb_lignes: int = 10) -> list[dict]:
    """Retourne les premières lignes du DataFrame sous forme de liste de dicts."""
    return df.head(nb_lignes).to_dict(orient="records")

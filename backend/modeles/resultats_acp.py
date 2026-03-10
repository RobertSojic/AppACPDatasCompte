"""Modèles Pydantic pour les résultats de l'ACP."""

from pydantic import BaseModel


class ReponseACP(BaseModel):
    """Résultats complets de l'analyse en composantes principales."""
    # Valeurs propres et variance
    valeurs_propres: list[float]
    variance_expliquee: list[float]
    variance_cumulee: list[float]

    # Coordonnées factorielles
    coordonnees_individus: dict[str, list[float]]
    coordonnees_variables: dict[str, list[float]]

    # Contributions (en %)
    contributions_individus: dict[str, list[float]]
    contributions_variables: dict[str, list[float]]

    # Qualité de représentation (cos²)
    cos2_individus: dict[str, list[float]]
    cos2_variables: dict[str, list[float]]

    # Métadonnées
    noms_individus: list[str]
    noms_variables: list[str]
    entreprises_par_individu: list[str]
    annees_par_individu: list[int]
    nb_composantes: int

"""Modèles Pydantic pour les données financières importées."""

from pydantic import BaseModel


class RequeteImport(BaseModel):
    """Requête d'import de fichier."""
    chemin_fichier: str


class InfoEntreprise(BaseModel):
    """Information sur une entreprise détectée."""
    id: str
    nom: str
    categorie: str


class Alerte(BaseModel):
    """Alerte de validation."""
    type: str  # "erreur" ou "avertissement"
    message: str


class ReponseImport(BaseModel):
    """Réponse complète de l'import."""
    apercu: list[dict]
    colonnes: list[str]
    entreprises: list[InfoEntreprise]
    annees: list[int]
    variables: list[str]
    alertes: list[Alerte]
    est_valide: bool
    total_bilan_colonne: str

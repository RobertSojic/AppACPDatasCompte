"""Modèles Pydantic pour la configuration de l'analyse ACP."""

from pydantic import BaseModel


class RequeteConfiguration(BaseModel):
    """Configuration du périmètre d'analyse."""
    chemin_fichier: str
    entreprises: list[str]
    annees: list[int]
    variables: list[str]
    standardisation: bool = True

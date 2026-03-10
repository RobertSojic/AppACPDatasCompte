"""Routes de configuration de l'analyse ACP."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.lecteur_fichier import lire_fichier
from services.validateur import (
    extraire_entreprises,
    extraire_annees,
    identifier_colonnes_postes,
)

router = APIRouter(tags=["configuration"])


class RequeteConfig(BaseModel):
    """Requête pour récupérer les options de configuration."""
    chemin_fichier: str


class ReponseConfig(BaseModel):
    """Options de configuration disponibles."""
    entreprises: list[dict]
    annees: list[int]
    variables: list[str]


@router.post("/configurer", response_model=ReponseConfig)
async def configurer_analyse(requete: RequeteConfig):
    """Retourne les options de configuration disponibles pour le fichier."""
    try:
        df = lire_fichier(requete.chemin_fichier)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    return ReponseConfig(
        entreprises=extraire_entreprises(df),
        annees=extraire_annees(df),
        variables=identifier_colonnes_postes(df),
    )

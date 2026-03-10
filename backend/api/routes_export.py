"""Routes d'export des résultats."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(tags=["export"])


class RequeteExport(BaseModel):
    """Requête d'export."""
    format: str = "xlsx"  # "csv" ou "xlsx"
    chemin_sortie: str


@router.post("/exporter")
async def exporter_resultats(requete: RequeteExport):
    """Exporte les résultats (image ou données numériques)."""
    # L'export sera implémenté en Phase 7 avec l'état persistant des résultats.
    # Pour l'instant, le frontend gèrera l'export directement via Plotly.
    return {"message": "Export à implémenter avec l'état persistant"}

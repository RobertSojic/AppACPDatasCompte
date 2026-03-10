"""Routes d'import de fichiers (CSV/XLSX)."""

from fastapi import APIRouter, HTTPException

from modeles.donnees_financieres import RequeteImport, ReponseImport
from services.lecteur_fichier import lire_fichier, extraire_apercu
from services.validateur import (
    valider,
    extraire_entreprises,
    extraire_annees,
    identifier_colonnes_postes,
    COLONNE_TOTAL_BILAN,
)

router = APIRouter(tags=["import"])


@router.post("/importer", response_model=ReponseImport)
async def importer_fichier(requete: RequeteImport):
    """Importe et valide un fichier de données financières."""
    try:
        df = lire_fichier(requete.chemin_fichier)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la lecture du fichier : {e}",
        )

    # Validation
    alertes, est_valide = valider(df)

    # Extraction des métadonnées
    apercu = extraire_apercu(df)
    colonnes = df.columns.tolist()
    entreprises = extraire_entreprises(df) if est_valide or len(alertes) < 4 else []
    annees = extraire_annees(df)
    variables = identifier_colonnes_postes(df)

    return ReponseImport(
        apercu=apercu,
        colonnes=colonnes,
        entreprises=entreprises,
        annees=annees,
        variables=variables,
        alertes=alertes,
        est_valide=est_valide,
        total_bilan_colonne=COLONNE_TOTAL_BILAN,
    )

"""Routes de calcul ACP."""

from fastapi import APIRouter, HTTPException

from modeles.configuration_acp import RequeteConfiguration
from modeles.resultats_acp import ReponseACP
from services.lecteur_fichier import lire_fichier
from services.transformateur import transformer_en_pourcentages, construire_matrice_acp
from services.moteur_acp import calculer_acp

router = APIRouter(tags=["acp"])


@router.post("/calculer-acp", response_model=ReponseACP)
async def lancer_acp(config: RequeteConfiguration):
    """Lance le calcul ACP et retourne les résultats complets."""
    try:
        # Lecture du fichier
        df = lire_fichier(config.chemin_fichier)

        # Transformation en pourcentages du total bilan
        df_pct = transformer_en_pourcentages(df, config.variables)

        # Construction de la matrice d'analyse
        matrice, noms_ind, entreprises, annees = construire_matrice_acp(
            df_pct,
            entreprises=config.entreprises,
            annees=config.annees,
            variables=config.variables,
        )

        # Calcul ACP
        resultats = calculer_acp(
            matrice=matrice,
            noms_individus=noms_ind,
            noms_variables=config.variables,
            entreprises_par_individu=entreprises,
            annees_par_individu=annees,
            standardisation=config.standardisation,
        )

        return ReponseACP(**resultats.vers_dict())

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du calcul ACP : {e}",
        )

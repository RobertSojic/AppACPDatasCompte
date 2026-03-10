"""
Module de calcul ACP (Analyse en Composantes Principales).
Utilise scikit-learn PCA et calcule manuellement les métriques
compatibles avec FactoMineR::PCA() sous R.

Métriques calculées :
- Valeurs propres (eigenvalues)
- Pourcentage de variance expliquée et cumulé
- Coordonnées factorielles des individus et des variables
- Contributions des individus et des variables (en %)
- Qualité de représentation cos² des individus et des variables
"""

import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler


class ResultatsACP:
    """Conteneur des résultats de l'ACP."""

    def __init__(
        self,
        valeurs_propres: np.ndarray,
        variance_expliquee: np.ndarray,
        coord_individus: pd.DataFrame,
        coord_variables: pd.DataFrame,
        contrib_individus: pd.DataFrame,
        contrib_variables: pd.DataFrame,
        cos2_individus: pd.DataFrame,
        cos2_variables: pd.DataFrame,
        noms_individus: list[str],
        noms_variables: list[str],
        entreprises_par_individu: list[str],
        annees_par_individu: list[int],
        nb_composantes: int,
    ):
        self.valeurs_propres = valeurs_propres
        self.variance_expliquee = variance_expliquee
        self.coord_individus = coord_individus
        self.coord_variables = coord_variables
        self.contrib_individus = contrib_individus
        self.contrib_variables = contrib_variables
        self.cos2_individus = cos2_individus
        self.cos2_variables = cos2_variables
        self.noms_individus = noms_individus
        self.noms_variables = noms_variables
        self.entreprises_par_individu = entreprises_par_individu
        self.annees_par_individu = annees_par_individu
        self.nb_composantes = nb_composantes

    def vers_dict(self) -> dict:
        """Convertit les résultats en dictionnaire sérialisable JSON."""
        variance_cumulee = np.cumsum(self.variance_expliquee).tolist()
        axes = [f"PC{i+1}" for i in range(self.nb_composantes)]

        return {
            "valeurs_propres": self.valeurs_propres.tolist(),
            "variance_expliquee": self.variance_expliquee.tolist(),
            "variance_cumulee": variance_cumulee,
            "coordonnees_individus": {
                nom: self.coord_individus.loc[nom].tolist()
                for nom in self.noms_individus
            },
            "coordonnees_variables": {
                nom: self.coord_variables.loc[nom].tolist()
                for nom in self.noms_variables
            },
            "contributions_individus": {
                nom: self.contrib_individus.loc[nom].tolist()
                for nom in self.noms_individus
            },
            "contributions_variables": {
                nom: self.contrib_variables.loc[nom].tolist()
                for nom in self.noms_variables
            },
            "cos2_individus": {
                nom: self.cos2_individus.loc[nom].tolist()
                for nom in self.noms_individus
            },
            "cos2_variables": {
                nom: self.cos2_variables.loc[nom].tolist()
                for nom in self.noms_variables
            },
            "noms_individus": self.noms_individus,
            "noms_variables": self.noms_variables,
            "entreprises_par_individu": self.entreprises_par_individu,
            "annees_par_individu": self.annees_par_individu,
            "nb_composantes": self.nb_composantes,
        }


def calculer_acp(
    matrice: pd.DataFrame,
    noms_individus: list[str],
    noms_variables: list[str],
    entreprises_par_individu: list[str],
    annees_par_individu: list[int],
    standardisation: bool = True,
    nb_composantes: int | None = None,
) -> ResultatsACP:
    """
    Calcule l'ACP avec des métriques compatibles FactoMineR::PCA().

    Paramètres:
        matrice: DataFrame (n_obs × n_vars) avec les données en pourcentages.
        noms_individus: Labels des individus.
        noms_variables: Labels des variables.
        entreprises_par_individu: Entreprise pour chaque observation.
        annees_par_individu: Année pour chaque observation.
        standardisation: Si True, données centrées-réduites (défaut FactoMineR).
        nb_composantes: Nombre de composantes à conserver (défaut = min(n, p)).

    Retourne:
        ResultatsACP contenant toutes les métriques.
    """
    X = matrice.values.astype(float)
    n_obs, n_vars = X.shape

    if nb_composantes is None:
        nb_composantes = min(n_obs, n_vars)

    # --- Étape 1 : Standardisation ---
    if standardisation:
        # Centrée-réduite (comme FactoMineR avec scale.unit=TRUE, le défaut)
        scaler = StandardScaler(with_mean=True, with_std=True)
        X_scaled = scaler.fit_transform(X)
    else:
        # Centrée seulement
        scaler = StandardScaler(with_mean=True, with_std=False)
        X_scaled = scaler.fit_transform(X)

    # --- Étape 2 : Calcul ACP via scikit-learn ---
    pca = PCA(n_components=nb_composantes)
    pca.fit(X_scaled)

    # Valeurs propres (eigenvalues)
    # sklearn divise par (n-1), FactoMineR divise par n.
    # Correction : λ_FactoMineR = λ_sklearn × (n-1) / n
    valeurs_propres = pca.explained_variance_ * (n_obs - 1) / n_obs

    # Pourcentage de variance expliquée (recalculé à partir des VP corrigées)
    total_inertie = valeurs_propres.sum()
    variance_expliquee = (valeurs_propres / total_inertie) * 100

    # --- Étape 3 : Coordonnées factorielles des individus ---
    # FactoMineR: ind$coord = X_scaled %*% V (vecteurs propres)
    # Identique à pca.transform(X_scaled) — les vecteurs propres V
    # sont les mêmes quelle que soit la convention n vs n-1.
    coord_individus = pca.transform(X_scaled)

    # --- Étape 4 : Coordonnées factorielles des variables ---
    # FactoMineR: var$coord[j,k] = cor(X_j, PC_k) = v_jk × √λ_k
    # On utilise les VP corrigées (convention FactoMineR).
    coord_variables = pca.components_.T * np.sqrt(valeurs_propres)

    # Seuil pour considérer une valeur propre comme non-nulle
    SEUIL_VP = 1e-10

    # --- Étape 5 : Contributions des individus (en %) ---
    # FactoMineR: ind$contrib[i,k] = (coord_ind[i,k]^2 / eigenvalue[k]) / n * 100
    contrib_individus = np.zeros_like(coord_individus)
    for k in range(nb_composantes):
        if valeurs_propres[k] > SEUIL_VP:
            contrib_individus[:, k] = (
                (coord_individus[:, k] ** 2) / (valeurs_propres[k] * n_obs) * 100
            )

    # --- Étape 6 : Contributions des variables (en %) ---
    # FactoMineR: var$contrib[j,k] = coord_var[j,k]^2 / eigenvalue[k] * 100
    contrib_variables = np.zeros_like(coord_variables)
    for k in range(nb_composantes):
        if valeurs_propres[k] > SEUIL_VP:
            contrib_variables[:, k] = (
                (coord_variables[:, k] ** 2) / valeurs_propres[k] * 100
            )

    # --- Étape 7 : Cos² des individus ---
    # FactoMineR: ind$cos2[i,k] = coord_ind[i,k]^2 / dist_au_centre[i]^2
    dist2_individus = np.sum(coord_individus ** 2, axis=1, keepdims=True)
    # Éviter division par zéro
    dist2_individus = np.where(dist2_individus == 0, 1e-10, dist2_individus)
    cos2_individus = coord_individus ** 2 / dist2_individus

    # --- Étape 8 : Cos² des variables ---
    # FactoMineR: var$cos2[j,k] = coord_var[j,k]^2
    # (car les variables sont standardisées, leur norme = 1)
    cos2_variables = coord_variables ** 2

    # --- Construction des DataFrames avec labels ---
    axes = [f"PC{i+1}" for i in range(nb_composantes)]

    df_coord_ind = pd.DataFrame(
        coord_individus, index=noms_individus, columns=axes
    )
    df_coord_var = pd.DataFrame(
        coord_variables, index=noms_variables, columns=axes
    )
    df_contrib_ind = pd.DataFrame(
        contrib_individus, index=noms_individus, columns=axes
    )
    df_contrib_var = pd.DataFrame(
        contrib_variables, index=noms_variables, columns=axes
    )
    df_cos2_ind = pd.DataFrame(
        cos2_individus, index=noms_individus, columns=axes
    )
    df_cos2_var = pd.DataFrame(
        cos2_variables, index=noms_variables, columns=axes
    )

    return ResultatsACP(
        valeurs_propres=valeurs_propres,
        variance_expliquee=variance_expliquee,
        coord_individus=df_coord_ind,
        coord_variables=df_coord_var,
        contrib_individus=df_contrib_ind,
        contrib_variables=df_contrib_var,
        cos2_individus=df_cos2_ind,
        cos2_variables=df_cos2_var,
        noms_individus=noms_individus,
        noms_variables=noms_variables,
        entreprises_par_individu=entreprises_par_individu,
        annees_par_individu=annees_par_individu,
        nb_composantes=nb_composantes,
    )

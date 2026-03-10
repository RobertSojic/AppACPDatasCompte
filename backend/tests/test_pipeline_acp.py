"""
Test complet du pipeline ACP : lecture → validation → transformation → ACP.
Vérifie la cohérence des résultats numériques (propriétés mathématiques).
"""

import os
import sys
import numpy as np
import pandas as pd

# Ajouter le répertoire parent au path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.lecteur_fichier import lire_fichier, extraire_apercu
from services.validateur import (
    valider,
    extraire_entreprises,
    extraire_annees,
    identifier_colonnes_postes,
)
from services.transformateur import transformer_en_pourcentages, construire_matrice_acp
from services.moteur_acp import calculer_acp

# Chemin vers les données de test
CHEMIN_CSV = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "donnees-test",
    "bilan_abrege_5x3.csv",
)


def test_lecture_csv():
    """Vérifie la lecture du fichier CSV de test."""
    df = lire_fichier(CHEMIN_CSV)
    assert len(df) == 15, f"Attendu 15 lignes, obtenu {len(df)}"
    assert "Entreprise" in df.columns
    assert "Annee" in df.columns
    assert "Total_bilan" in df.columns
    print("✓ Lecture CSV : 15 observations lues correctement")
    return df


def test_apercu(df):
    """Vérifie l'extraction de l'aperçu."""
    apercu = extraire_apercu(df, 5)
    assert len(apercu) == 5
    assert isinstance(apercu[0], dict)
    print("✓ Aperçu : 5 premières lignes extraites")


def test_validation(df):
    """Vérifie la validation du jeu de données."""
    alertes, est_valide = valider(df)
    assert est_valide, f"Données invalides : {alertes}"
    print(f"✓ Validation : données valides ({len(alertes)} alertes)")
    return alertes


def test_extraction_metadata(df):
    """Vérifie l'extraction des métadonnées."""
    entreprises = extraire_entreprises(df)
    assert len(entreprises) == 5, f"Attendu 5 entreprises, obtenu {len(entreprises)}"

    annees = extraire_annees(df)
    assert annees == [2021, 2022, 2023], f"Années inattendues : {annees}"

    variables = identifier_colonnes_postes(df)
    assert len(variables) == 12, f"Attendu 12 variables, obtenu {len(variables)}"

    print(f"✓ Métadonnées : {len(entreprises)} entreprises, {annees}, {len(variables)} variables")
    return entreprises, annees, variables


def test_transformation(df, variables):
    """Vérifie la transformation en pourcentages."""
    df_pct = transformer_en_pourcentages(df, variables)

    # Vérifier que la somme des postes actif = ~100% et passif = ~100%
    postes_actif = [v for v in variables if v in [
        "Immobilisations_incorporelles", "Immobilisations_corporelles",
        "Immobilisations_financieres", "Stocks", "Creances", "Tresorerie_active",
    ]]

    for _, row in df_pct.iterrows():
        total_actif_pct = sum(row[p] for p in postes_actif)
        assert abs(total_actif_pct - 100) < 0.1, (
            f"Total actif % = {total_actif_pct:.2f} pour "
            f"{row['Entreprise']} {row['Annee']}"
        )

    print("✓ Transformation : pourcentages corrects (actif ≈ 100%)")
    return df_pct


def test_construction_matrice(df_pct, variables):
    """Vérifie la construction de la matrice ACP."""
    entreprises = df_pct["Entreprise"].unique().tolist()
    annees = sorted(df_pct["Annee"].unique().tolist())

    matrice, noms_ind, noms_ent, noms_ann = construire_matrice_acp(
        df_pct, entreprises, annees, variables
    )

    assert matrice.shape == (15, 12), f"Shape inattendu : {matrice.shape}"
    assert len(noms_ind) == 15
    assert len(noms_ent) == 15
    assert len(noms_ann) == 15
    assert "Alpha_SA_2021" in noms_ind

    print(f"✓ Matrice ACP : {matrice.shape[0]} obs × {matrice.shape[1]} vars")
    return matrice, noms_ind, noms_ent, noms_ann


def test_acp(matrice, noms_ind, variables, noms_ent, noms_ann):
    """
    Vérifie les propriétés mathématiques des résultats ACP :
    1. Somme des valeurs propres = nombre de variables (si standardisé)
    2. Variance expliquée somme à 100%
    3. Contributions des individus somment à 100% par axe
    4. Contributions des variables somment à 100% par axe
    5. Cos² des individus entre 0 et 1, somme par individu = 1
    6. Cos² des variables entre 0 et 1
    """
    resultats = calculer_acp(
        matrice=matrice,
        noms_individus=noms_ind,
        noms_variables=variables,
        entreprises_par_individu=noms_ent,
        annees_par_individu=noms_ann,
        standardisation=True,
    )

    n_comp = resultats.nb_composantes
    print(f"\n  ACP calculée : {n_comp} composantes")

    # 1. Somme des valeurs propres ≈ nombre de variables
    somme_vp = sum(resultats.valeurs_propres)
    n_vars = len(variables)
    print(f"  Somme valeurs propres = {somme_vp:.4f} (attendu ≈ {n_vars})")
    assert abs(somme_vp - n_vars) < 0.01, (
        f"Somme VP = {somme_vp}, attendu {n_vars}"
    )
    print("  ✓ Somme VP = nombre de variables")

    # 2. Variance expliquée somme à 100%
    somme_var = sum(resultats.variance_expliquee)
    assert abs(somme_var - 100) < 0.01, f"Somme variance = {somme_var}%"
    print(f"  ✓ Variance expliquée somme à {somme_var:.2f}%")

    # Afficher les premières composantes
    for i in range(min(5, n_comp)):
        print(
            f"    PC{i+1}: VP={resultats.valeurs_propres[i]:.4f}, "
            f"Var={resultats.variance_expliquee[i]:.2f}%"
        )

    # 3. Contributions des individus somment à 100% par axe
    #    (uniquement pour les axes avec VP significative)
    nb_axes_signif = sum(1 for vp in resultats.valeurs_propres if vp > 1e-10)
    for k in range(nb_axes_signif):
        axe = f"PC{k+1}"
        somme_contrib = resultats.contrib_individus[axe].sum()
        assert abs(somme_contrib - 100) < 0.01, (
            f"Contrib individus {axe} = {somme_contrib}%"
        )
    print(f"  ✓ Contributions individus somment à 100% ({nb_axes_signif} axes significatifs)")

    # 4. Contributions des variables somment à 100% par axe
    for k in range(nb_axes_signif):
        axe = f"PC{k+1}"
        somme_contrib = resultats.contrib_variables[axe].sum()
        assert abs(somme_contrib - 100) < 0.01, (
            f"Contrib variables {axe} = {somme_contrib}%"
        )
    print(f"  ✓ Contributions variables somment à 100% ({nb_axes_signif} axes significatifs)")

    # 5. Cos² des individus
    cos2_ind = resultats.cos2_individus.values
    assert np.all(cos2_ind >= -1e-10), "Cos² individus négatif"
    assert np.all(cos2_ind <= 1 + 1e-10), "Cos² individus > 1"
    # Somme par individu ≈ 1 (si toutes les composantes sont conservées)
    sommes_cos2 = cos2_ind.sum(axis=1)
    for i, s in enumerate(sommes_cos2):
        assert abs(s - 1) < 0.01, f"Cos² ind {noms_ind[i]} = {s}"
    print("  ✓ Cos² individus ∈ [0,1], somme = 1 par individu")

    # 6. Cos² des variables
    cos2_var = resultats.cos2_variables.values
    assert np.all(cos2_var >= -1e-10), "Cos² variables négatif"
    assert np.all(cos2_var <= 1 + 1e-10), "Cos² variables > 1"
    print("  ✓ Cos² variables ∈ [0,1]")

    # 7. Vérifier la sérialisation JSON
    d = resultats.vers_dict()
    assert len(d["valeurs_propres"]) == n_comp
    assert len(d["coordonnees_individus"]) == 15
    assert len(d["coordonnees_variables"]) == 12
    print("  ✓ Sérialisation JSON correcte")

    print("\n✓ Toutes les propriétés mathématiques ACP sont vérifiées")
    return resultats


def main():
    """Exécute tous les tests."""
    print("=" * 60)
    print("Test du pipeline ACP FinMap")
    print("=" * 60)

    df = test_lecture_csv()
    test_apercu(df)
    test_validation(df)
    entreprises, annees, variables = test_extraction_metadata(df)
    df_pct = test_transformation(df, variables)
    matrice, noms_ind, noms_ent, noms_ann = test_construction_matrice(df_pct, variables)
    resultats = test_acp(matrice, noms_ind, variables, noms_ent, noms_ann)

    print("\n" + "=" * 60)
    print("TOUS LES TESTS PASSENT")
    print("=" * 60)


if __name__ == "__main__":
    main()

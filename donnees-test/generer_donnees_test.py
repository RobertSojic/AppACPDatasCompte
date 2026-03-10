"""
Génération de données de test fictives pour FinMap.
5 entreprises × 3 années × 12 postes comptables (bilan abrégé).
Chaque entreprise a un profil financier distinct et réaliste.
"""

import pandas as pd
import numpy as np
import os

# Initialisation du générateur aléatoire pour reproductibilité
rng = np.random.default_rng(42)

# Configuration
ANNEES = [2021, 2022, 2023]
CATEGORIE = "abrege"

# Postes comptables du bilan abrégé
POSTES_ACTIF = [
    "Immobilisations_incorporelles",
    "Immobilisations_corporelles",
    "Immobilisations_financieres",
    "Stocks",
    "Creances",
    "Tresorerie_active",
]

POSTES_PASSIF = [
    "Capitaux_propres",
    "Reserves",
    "Resultat_exercice",
    "Dettes_financieres_LT",
    "Dettes_commerciales",
    "Autres_dettes_CT",
]

POSTES = POSTES_ACTIF + POSTES_PASSIF

# Profils de base (en % du total bilan) par entreprise
# Chaque profil reflète un type d'activité différent
PROFILS = {
    "Alpha_SA": {
        # Industrielle : actifs corporels élevés, dette modérée
        "Immobilisations_incorporelles": 3,
        "Immobilisations_corporelles": 45,
        "Immobilisations_financieres": 5,
        "Stocks": 15,
        "Creances": 20,
        "Tresorerie_active": 12,
        "Capitaux_propres": 20,
        "Reserves": 15,
        "Resultat_exercice": 5,
        "Dettes_financieres_LT": 30,
        "Dettes_commerciales": 20,
        "Autres_dettes_CT": 10,
    },
    "Beta_Corp": {
        # Commerciale : stocks et créances élevés
        "Immobilisations_incorporelles": 2,
        "Immobilisations_corporelles": 15,
        "Immobilisations_financieres": 3,
        "Stocks": 35,
        "Creances": 30,
        "Tresorerie_active": 15,
        "Capitaux_propres": 15,
        "Reserves": 10,
        "Resultat_exercice": 8,
        "Dettes_financieres_LT": 12,
        "Dettes_commerciales": 35,
        "Autres_dettes_CT": 20,
    },
    "Gamma_SAS": {
        # Tech/Services : peu d'actifs fixes, beaucoup de trésorerie
        "Immobilisations_incorporelles": 20,
        "Immobilisations_corporelles": 8,
        "Immobilisations_financieres": 7,
        "Stocks": 2,
        "Creances": 25,
        "Tresorerie_active": 38,
        "Capitaux_propres": 25,
        "Reserves": 20,
        "Resultat_exercice": 12,
        "Dettes_financieres_LT": 8,
        "Dettes_commerciales": 15,
        "Autres_dettes_CT": 20,
    },
    "Delta_SARL": {
        # Immobilier : très gros actifs corporels, dettes LT élevées
        "Immobilisations_incorporelles": 1,
        "Immobilisations_corporelles": 70,
        "Immobilisations_financieres": 5,
        "Stocks": 2,
        "Creances": 12,
        "Tresorerie_active": 10,
        "Capitaux_propres": 18,
        "Reserves": 7,
        "Resultat_exercice": 5,
        "Dettes_financieres_LT": 50,
        "Dettes_commerciales": 10,
        "Autres_dettes_CT": 10,
    },
    "Epsilon_SA": {
        # Holding : actifs financiers élevés, capitaux propres élevés
        "Immobilisations_incorporelles": 2,
        "Immobilisations_corporelles": 5,
        "Immobilisations_financieres": 60,
        "Stocks": 1,
        "Creances": 15,
        "Tresorerie_active": 17,
        "Capitaux_propres": 40,
        "Reserves": 25,
        "Resultat_exercice": 10,
        "Dettes_financieres_LT": 15,
        "Dettes_commerciales": 5,
        "Autres_dettes_CT": 5,
    },
}


def generer_donnees():
    """Génère le jeu de données de test."""
    lignes = []

    for entreprise, profil_base in PROFILS.items():
        # Taille de bilan de base (en milliers d'euros)
        taille_bilan = rng.integers(5_000, 50_000)

        for i, annee in enumerate(ANNEES):
            # Croissance annuelle aléatoire (entre -5% et +10%)
            facteur_croissance = 1 + rng.uniform(-0.05, 0.10) * (i)
            total_bilan = int(taille_bilan * facteur_croissance)

            # Variation aléatoire des pourcentages autour du profil de base
            actif_pcts = {}
            for poste in POSTES_ACTIF:
                base = profil_base[poste]
                variation = rng.normal(0, base * 0.1)  # écart-type 10% de la base
                actif_pcts[poste] = max(0.5, base + variation)

            # Normaliser l'actif à 100%
            total_actif_pct = sum(actif_pcts.values())
            for poste in POSTES_ACTIF:
                actif_pcts[poste] = actif_pcts[poste] / total_actif_pct * 100

            passif_pcts = {}
            for poste in POSTES_PASSIF:
                base = profil_base[poste]
                variation = rng.normal(0, base * 0.1)
                passif_pcts[poste] = max(0.5, base + variation)

            # Normaliser le passif à 100%
            total_passif_pct = sum(passif_pcts.values())
            for poste in POSTES_PASSIF:
                passif_pcts[poste] = passif_pcts[poste] / total_passif_pct * 100

            # Convertir en valeurs absolues (milliers d'euros)
            ligne = {
                "Entreprise": entreprise,
                "Annee": annee,
                "Categorie_bilantaire": CATEGORIE,
            }

            for poste in POSTES_ACTIF:
                ligne[poste] = round(total_bilan * actif_pcts[poste] / 100)

            for poste in POSTES_PASSIF:
                ligne[poste] = round(total_bilan * passif_pcts[poste] / 100)

            # Ajuster pour que Total Actif == Total Passif exactement
            total_actif = sum(ligne[p] for p in POSTES_ACTIF)
            total_passif = sum(ligne[p] for p in POSTES_PASSIF)
            diff = total_actif - total_passif
            # Ajuster le poste le plus gros du passif
            poste_ajust = max(POSTES_PASSIF, key=lambda p: ligne[p])
            ligne[poste_ajust] += diff

            # Total bilan = somme de l'actif
            ligne["Total_bilan"] = sum(ligne[p] for p in POSTES_ACTIF)

            lignes.append(ligne)

    # Ordre des colonnes
    colonnes = (
        ["Entreprise", "Annee", "Categorie_bilantaire"]
        + POSTES_ACTIF
        + POSTES_PASSIF
        + ["Total_bilan"]
    )
    df = pd.DataFrame(lignes, columns=colonnes)
    return df


def main():
    """Génère et sauvegarde les fichiers de test."""
    repertoire = os.path.dirname(os.path.abspath(__file__))

    df = generer_donnees()

    # Sauvegarder en CSV (séparateur ;)
    chemin_csv = os.path.join(repertoire, "bilan_abrege_5x3.csv")
    df.to_csv(chemin_csv, index=False, sep=";")
    print(f"CSV généré : {chemin_csv}")

    # Sauvegarder en Excel
    chemin_xlsx = os.path.join(repertoire, "bilan_abrege_5x3.xlsx")
    df.to_excel(chemin_xlsx, index=False)
    print(f"Excel généré : {chemin_xlsx}")

    # Générer le template vide
    template = pd.DataFrame(columns=df.columns)
    template.loc[0] = ["NOM_ENTREPRISE", 2023, "abrege"] + [0] * (len(df.columns) - 3)
    chemin_template = os.path.join(repertoire, "template_bilan_abrege.csv")
    template.to_csv(chemin_template, index=False, sep=";")
    print(f"Template généré : {chemin_template}")

    # Afficher un aperçu
    print(f"\n{len(df)} observations générées :")
    print(df.to_string(index=False))

    # Vérifier l'équilibre actif/passif
    for _, row in df.iterrows():
        actif = sum(row[p] for p in POSTES_ACTIF)
        passif = sum(row[p] for p in POSTES_PASSIF)
        assert actif == passif, (
            f"Déséquilibre pour {row['Entreprise']} {row['Annee']}: "
            f"actif={actif}, passif={passif}"
        )
    print("\nVérification : tous les bilans sont équilibrés (actif = passif).")


if __name__ == "__main__":
    main()

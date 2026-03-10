/**
 * Client HTTP pour communiquer avec le backend Python FastAPI.
 */

let portBackend: number | null = null;

/** Définir le port du backend (appelé au démarrage) */
export function setPortBackend(port: number) {
  portBackend = port;
}

/** URL de base du backend */
function baseUrl(): string {
  if (!portBackend) {
    throw new Error("Le port du backend n'est pas encore configuré");
  }
  return `http://127.0.0.1:${portBackend}/api`;
}

/** Appel générique au backend */
async function appelerBackend<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const reponse = await fetch(`${baseUrl()}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!reponse.ok) {
    const erreur = await reponse.text();
    throw new Error(`Erreur backend (${reponse.status}): ${erreur}`);
  }

  return reponse.json();
}

/** Vérifier que le backend est prêt */
export async function verifierSante(): Promise<boolean> {
  try {
    const r = await appelerBackend<{ statut: string }>("/sante");
    return r.statut === "ok";
  } catch {
    return false;
  }
}

/** Importer un fichier de données */
export async function importerFichier(cheminFichier: string) {
  return appelerBackend("/importer", {
    method: "POST",
    body: JSON.stringify({ chemin_fichier: cheminFichier }),
  });
}

/** Lancer le calcul ACP */
export async function calculerACP(configuration: {
  cheminFichier: string;
  entreprises: string[];
  annees: number[];
  variables: string[];
  standardisation: boolean;
}) {
  return appelerBackend("/calculer-acp", {
    method: "POST",
    body: JSON.stringify(configuration),
  });
}

/** Exporter les résultats */
export async function exporterResultats(options: {
  format: "csv" | "xlsx";
  cheminSortie: string;
}) {
  return appelerBackend("/exporter", {
    method: "POST",
    body: JSON.stringify(options),
  });
}

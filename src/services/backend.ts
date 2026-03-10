/**
 * Gestion du backend Python.
 * En mode dev (navigateur), connecte à un backend lancé manuellement.
 * En mode Tauri (desktop), lance le sidecar Python automatiquement.
 */

import { setPortBackend, verifierSante } from "./api";

/** Port par défaut pour le développement */
const PORT_DEV = 8765;

/** Vérifie si on est dans un environnement Tauri */
function estTauri(): boolean {
  return "__TAURI_INTERNALS__" in window;
}

/**
 * Initialise la connexion au backend Python.
 * Retente plusieurs fois si le backend n'est pas encore prêt.
 */
export async function initialiserBackend(): Promise<boolean> {
  if (estTauri()) {
    return await initialiserBackendTauri();
  } else {
    return await initialiserBackendDev();
  }
}

/** Mode développement : se connecte au backend Python lancé manuellement */
async function initialiserBackendDev(): Promise<boolean> {
  setPortBackend(PORT_DEV);

  // Attendre que le backend soit prêt (max 10 tentatives)
  for (let i = 0; i < 10; i++) {
    if (await verifierSante()) {
      console.log(`Backend connecté sur le port ${PORT_DEV}`);
      return true;
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  console.warn(
    `Backend non disponible sur le port ${PORT_DEV}. ` +
      `Lancez-le avec : cd backend && source .venv/bin/activate && python main.py`
  );
  return false;
}

/** Mode Tauri : lance le sidecar Python et récupère le port */
async function initialiserBackendTauri(): Promise<boolean> {
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const { Command } = await import("@tauri-apps/plugin-shell");

    // Lancer le backend Python comme processus enfant
    const command = Command.create("python-backend", [
      "-u",
      "../backend/main.py",
    ]);

    // Écouter stdout pour récupérer le port
    const portPromise = new Promise<number>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error("Timeout démarrage backend")),
        15000
      );

      command.stdout.on("data", (line: string) => {
        const match = line.match(/^PORT:(\d+)/);
        if (match) {
          clearTimeout(timeout);
          resolve(parseInt(match[1], 10));
        }
      });

      command.stderr.on("data", (line: string) => {
        console.error("[Backend]", line);
      });
    });

    // Démarrer le processus
    const child = await command.spawn();
    console.log("Sidecar Python lancé, PID:", child.pid);

    // Attendre le port
    const port = await portPromise;
    setPortBackend(port);
    await invoke("set_backend_port", { port });

    console.log(`Backend Tauri connecté sur le port ${port}`);
    return true;
  } catch (e) {
    console.error("Erreur lancement sidecar Python:", e);
    return false;
  }
}

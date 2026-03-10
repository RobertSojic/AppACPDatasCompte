"""
Point d'entrée du backend FastAPI FinMap.
Lance un serveur HTTP local sur un port dynamique
et communique le port au processus Tauri via stdout.
"""

import sys
import socket
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes_import import router as import_router
from api.routes_configuration import router as config_router
from api.routes_acp import router as acp_router
from api.routes_export import router as export_router


def trouver_port_libre() -> int:
    """Trouve un port TCP libre sur localhost."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


app = FastAPI(
    title="FinMap Backend",
    description="API de calcul ACP pour FinMap",
    version="0.1.0",
)

# CORS pour le frontend Tauri (webview)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrement des routes
app.include_router(import_router, prefix="/api")
app.include_router(config_router, prefix="/api")
app.include_router(acp_router, prefix="/api")
app.include_router(export_router, prefix="/api")


@app.get("/api/sante")
def healthcheck():
    """Vérification de l'état du serveur."""
    return {"statut": "ok"}


if __name__ == "__main__":
    # En mode dev, utiliser le port 8765 ; sinon port dynamique (sidecar Tauri)
    if "--dev" in sys.argv:
        port = 8765
    else:
        port = trouver_port_libre()
    # Communiquer le port au processus parent (Tauri)
    print(f"PORT:{port}", flush=True)
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")

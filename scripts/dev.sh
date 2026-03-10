#!/bin/bash
# Script de développement : lance le backend Python et le frontend Vite en parallèle.
# Usage : ./scripts/dev.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Lancer le backend Python
echo "Lancement du backend Python..."
cd "$PROJECT_DIR/backend"
source .venv/bin/activate
python main.py &
BACKEND_PID=$!

# Attendre que le backend soit prêt
sleep 2

# Lancer le frontend Vite
echo "Lancement du frontend Vite..."
cd "$PROJECT_DIR"
npm run dev &
FRONTEND_PID=$!

# Gérer l'arrêt propre
cleanup() {
    echo "Arrêt..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

wait

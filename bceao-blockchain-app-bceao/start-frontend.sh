#!/bin/bash

# start-frontend.sh

echo "Starting BCEAO Blockchain Frontend..."

# Vérifier si nous sommes dans le bon répertoire
if [ ! -d "./frontend" ]; then
    echo "Error: Must be run from bceao-blockchain-app directory"
    exit 1
fi

# Aller dans le répertoire frontend
cd frontend

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Vérifier si le backend est accessible
echo "Checking backend connection..."
if ! curl -s http://localhost:2002/test > /dev/null; then
    echo "Warning: Backend server not responding!"
    echo "Make sure to start the backend first with ./start-backend.sh"
fi

# Définir le port pour le frontend
export PORT=2001
echo "Starting frontend server on port $PORT..."
export NODE_OPTIONS=--openssl-legacy-provider
npm start
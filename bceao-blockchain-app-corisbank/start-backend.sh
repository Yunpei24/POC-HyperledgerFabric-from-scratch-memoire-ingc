#!/bin/bash

# start-backend.sh

echo "Starting BCEAO Blockchain Backend..."

# Vérifier si nous sommes dans le bon répertoire
if [ ! -d "./backend" ]; then
    echo "Error: Must be run from bceao-blockchain-app directory"
    exit 1
fi

# Aller dans le répertoire backend
cd backend

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Vérifier si le réseau blockchain est actif
if ! docker ps | grep -q "bceao"; then
    echo "Warning: Blockchain network containers not found!"
    echo "Make sure your Hyperledger Fabric network is running"
fi

# Définir le port pour le frontend
export PORT=3002
# Lancer le serveur backend
echo "Starting backend server..."
export NODE_OPTIONS=--openssl-legacy-provider
npm run dev
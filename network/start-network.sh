#!/bin/bash
# start-network.sh

# Définir les fichiers docker-compose à utiliser
COMPOSE_FILES="-f ./docker/docker-compose-ecobank.yaml -f ./docker/docker-compose-corisbank.yaml -f ./docker/docker-compose-orderer.yaml"

# Démarrer tous les containers
echo "Démarrage des containers..."
IMAGE_TAG=$IMAGETAG docker-compose ${COMPOSE_FILES} start

echo "Les containers ont été démarrés avec succès"
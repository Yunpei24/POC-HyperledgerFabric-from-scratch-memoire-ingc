#!/bin/bash
# stop-network.sh

# Définir les fichiers docker-compose à utiliser
COMPOSE_FILES="-f ./docker/docker-compose-ecobank.yaml -f ./docker/docker-compose-corisbank.yaml -f ./docker/docker-compose-orderer.yaml"

# Arrêter tous les containers
echo "Arrêt des containers..."
IMAGE_TAG=$IMAGETAG docker-compose ${COMPOSE_FILES} stop

echo "Les containers ont été arrêtés avec succès"
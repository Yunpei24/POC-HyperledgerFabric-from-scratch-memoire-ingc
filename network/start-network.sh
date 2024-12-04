#!/bin/bash
# start-network.sh

# Configuration des variables d'environnement
# Ajout du chemin vers les binaires Fabric
export PATH=${PWD}/../fabric-samples/bin:${PATH}
# Définition du chemin de configuration Fabric
export FABRIC_CFG_PATH=${PWD}/config

# Set environment variables for Fabric network
export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/crypto-material/ordererOrganizations/bceao.com/orderers/orderer0.bceao.com/msp/tlscacerts/tlsca.bceao.com-cert.pem
export CORE_PEER_LOCALMSPID=EcobankMSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto-material/peerOrganizations/ecobank.bceao.com/peers/peer0.ecobank.bceao.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-material/peerOrganizations/ecobank.bceao.com/users/Admin@ecobank.bceao.com/msp
export CORE_PEER_ADDRESS=localhost:7051

# Définir les fichiers docker-compose à utiliser
COMPOSE_FILES="-f ./docker/docker-compose-ecobank.yaml -f ./docker/docker-compose-corisbank.yaml -f ./docker/docker-compose-orderer.yaml -f ./docker/docker-compose-bceaoorg.yaml"

# Démarrer tous les containers
echo "Démarrage des containers..."
IMAGE_TAG=$IMAGETAG docker-compose ${COMPOSE_FILES} start

echo "Les containers ont été démarrés avec succès"
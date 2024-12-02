#!/bin/bash

# Configuration des variables d'environnement
# Ajout du chemin vers les binaires Fabric
export PATH=${PWD}/../fabric-samples/bin:${PATH}
# Définition du chemin de configuration Fabric
export FABRIC_CFG_PATH=${PWD}/config
# Version des images Docker à utiliser
export IMAGE_TAG=latest

# Importation des fonctions utilitaires
. ./utils.sh

# ----------------------- GÉNÉRATION DU MATÉRIEL CRYPTOGRAPHIQUE -----------------------#
# Génération des certificats et clés pour chaque organisation
printSeparator "Generate crypto-material for Ecobank"
cryptogen generate --config=./cryptogen-input/crypto-config-ecobank.yaml --output="crypto-material"

printSeparator "Generate crypto-material for Corisbank"
cryptogen generate --config=./cryptogen-input/crypto-config-corisbank.yaml --output="crypto-material"

printSeparator "Generate crypto-material for BCEAO"
cryptogen generate --config=./cryptogen-input/crypto-config-bceaoorg.yaml --output="crypto-material"


printSeparator "Generate crypto-material for Orderer"
cryptogen generate --config=./cryptogen-input/crypto-config-orderer.yaml --output="crypto-material"

# ----------------------- CRÉATION DU BLOC GÉNESIS -----------------------#
# Génération du bloc genesis pour le canal système
printSeparator "Create Genesis-Block"
configtxgen -profile ApNetworkProfile -configPath ${PWD}/config -channelID system-channel -outputBlock ./system-genesis-block/genesis.block

# ----------------------- DÉMARRAGE DU RÉSEAU -----------------------#
# Lancement des conteneurs Docker pour chaque organisation
printSeparator "Start Network within Docker Containers"
docker-compose -f ./docker/docker-compose-orderer.yaml -f ./docker/docker-compose-ecobank.yaml -f ./docker/docker-compose-corisbank.yaml -f ./docker/docker-compose-bceaoorg.yaml up -d

# ----------------------- CONFIGURATION DU CANAL -----------------------#
# Création de la transaction de création du canal
printSeparator "Create Channel Transaction"
configtxgen -profile ApChannelProfile -configPath ${PWD}/config -outputCreateChannelTx ./channel-artifacts/bceaochannel.tx -channelID bceaochannel && sleep 3

# Création des transactions de mise à jour des peers ancres pour chaque organisation
printSeparator "Create Anchor Peers Update for Ecobank"
configtxgen -profile ApChannelProfile -configPath ${PWD}/config -outputAnchorPeersUpdate ./channel-artifacts/EcobankMSPanchors.tx -channelID bceaochannel -asOrg Ecobank

printSeparator "Create Anchor Peers Update for Corisbank"
configtxgen -profile ApChannelProfile -configPath ${PWD}/config -outputAnchorPeersUpdate ./channel-artifacts/CorisbankMSPanchors.tx -channelID bceaochannel -asOrg Corisbank

printSeparator "Create Anchor Peers Update for BCEAO"
configtxgen -profile ApChannelProfile -configPath ${PWD}/config -outputAnchorPeersUpdate ./channel-artifacts/BCEAOORGMSPanchors.tx -channelID bceaochannel -asOrg BCEAOORG

printSeparator "Wait 3 seconds for network to come up" && sleep 3

# ----------------------- CONFIGURATION ECOBANK -----------------------#
# Configuration du peer0 d'Ecobank
printSeparator "Set Identity to peer0 of Ecobank"
switchIdentity "Ecobank" 7051 "peer0" && echoCurrentFabricEnvironment

# Création du canal par Ecobank
printSeparator "Create channel"
peer channel create -o localhost:7050 -c bceaochannel --ordererTLSHostnameOverride orderer0.bceao.com -f ./channel-artifacts/bceaochannel.tx --outputBlock ./channel-artifacts/bceaochannel.block --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA

# Rejoindre le canal avec peer0 d'Ecobank
printSeparator "Join Ecobank to channel"
peer channel join -b ./channel-artifacts/bceaochannel.block && sleep 1

# Mise à jour des peers ancres pour Ecobank
printSeparator "Update Anchor Peers as Ecobank"
peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer0.bceao.com -c bceaochannel -f ./channel-artifacts/EcobankMSPanchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA

# Configuration du peer1 d'Ecobank
printSeparator "Set Identity to peer1 of Ecobank"
switchIdentity "Ecobank" 7042 "peer1" && echoCurrentFabricEnvironment

# Rejoindre le canal avec peer1 d'Ecobank
printSeparator "Join Ecobank to channel"
peer channel join -b ./channel-artifacts/bceaochannel.block && sleep 1

# ----------------------- CONFIGURATION CORISBANK -----------------------#
# Configuration du peer0 de Corisbank
printSeparator "Set Identity to peer0 of Corisbank"
switchIdentity "Corisbank" 8051 "peer0" && echoCurrentFabricEnvironment && sleep 1

# Rejoindre le canal avec peer0 de Corisbank
printSeparator "Join Corisbank to channel"
peer channel join -b ./channel-artifacts/bceaochannel.block

# Mise à jour des peers ancres pour Corisbank
printSeparator "Update Anchor Peers as Corisbank"
peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer0.bceao.com -c bceaochannel -f ./channel-artifacts/CorisbankMSPanchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA

# Configuration du peer1 de Corisbank
printSeparator "Set Identity to peer1 of Corisbank"
switchIdentity "Corisbank" 8042 "peer1" && echoCurrentFabricEnvironment && sleep 1

# Rejoindre le canal avec peer1 de Corisbank
printSeparator "Join Corisbank to channel"
peer channel join -b ./channel-artifacts/bceaochannel.block

# ----------------------- CONFIGURATION BCEAO -----------------------#
# Configuration du peer0 de BCEAOORG
printSeparator "Set Identity to peer0 of BCEAOORG"
switchIdentity "BCEAOORG" 2024 "peer0" && echoCurrentFabricEnvironment && sleep 1

# Rejoindre le canal avec peer0 de BCEAOORG
printSeparator "Join BCEAOORG to channel"
peer channel join -b ./channel-artifacts/bceaochannel.block

# Mise à jour des peers ancres pour BCEAOORG
printSeparator "Update Anchor Peers as BCEAOORG"
peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer0.bceao.com -c bceaochannel -f ./channel-artifacts/BCEAOORGMSPanchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA

# Configuration du peer1 de BCEAOORG
printSeparator "Set Identity to peer1 of BCEAOORG"
switchIdentity "BCEAOORG" 3024 "peer1" && echoCurrentFabricEnvironment && sleep 1

# Rejoindre le canal avec peer1 de BCEAOORG
printSeparator "Join BCEAOORG to channel"
peer channel join -b ./channel-artifacts/bceaochannel.block

# ----------------------- CONFIGURATION DES PERMISSIONS -----------------------#
# Attribution des droits d'accès au matériel cryptographique
sudo chmod -R a=rwx ./crypto-material/

# Suppression des anciens matériels cryptographiques des autres applications
sudo rm -r ../explorer/crypto-material/
sudo rm -r ../bceao-blockchain-app/crypto-material/
sudo rm -r ../bceao-blockchain-app-corisbank/crypto-material/
sudo rm -r ../bceao-blockchain-app-bceao/crypto-material/

# Copie du nouveau matériel cryptographique vers les applications
sudo cp -r ./crypto-material ../explorer
sudo mkdir -p ../bceao-blockchain-app/crypto-material/peerOrganizations && sudo cp -r ./crypto-material/peerOrganizations/ecobank.bceao.com ../bceao-blockchain-app/crypto-material/peerOrganizations
sudo mkdir -p ../bceao-blockchain-app-corisbank/crypto-material/peerOrganizations && sudo cp -r ./crypto-material/peerOrganizations/corisbank.bceao.com ../bceao-blockchain-app-corisbank/crypto-material/peerOrganizations
sudo mkdir -p ../bceao-blockchain-app-bceao/crypto-material/peerOrganizations && sudo cp -r ./crypto-material/peerOrganizations/bceaoorg.bceao.com ../bceao-blockchain-app-bceao/crypto-material/peerOrganizations


# Attribution des droits d'accès pour les applications
sudo chmod -R a=rwx ../explorer/crypto-material/
sudo chmod -R a=rwx ../bceao-blockchain-app/crypto-material/
sudo chmod -R a=rwx ../bceao-blockchain-app-corisbank/crypto-material/
sudo chmod -R a=rwx ../bceao-blockchain-app-bceao/crypto-material/

printSeparator "Done!"
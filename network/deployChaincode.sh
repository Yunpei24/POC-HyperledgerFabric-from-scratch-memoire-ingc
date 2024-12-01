#!/bin/bash

# Définir les couleurs
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NO_COLOR='\033[0m'

export PATH=${PWD}/../fabric-samples/bin:${PATH}
export FABRIC_CFG_PATH=${PWD}/config

preSetupJavaScript() {
    printSeparator "Setting up JavaScript Environment"
    pushd ../chaincode-javascript/
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    # sudo rm -r node_modules || true
    # npm install
    sudo chmod -R a=rwx node_modules
    sudo rm package-lock.json || true
    popd
}

# Déclaration des variables
CHANNEL_NAME="bceaochannel"
CHAINCODE_NAME="bceaochaincode"
CHAINCODE_VERSION="4.0"
SEQUENCE=2
CHAINCODE_PATH="../chaincode-javascript/"
ORDERER_ADDRESS="localhost:7050"
ORDERER_TLS_HOSTNAME="orderer0.bceao.com"
ORDERER_CA="${PWD}/crypto-material/ordererOrganizations/bceao.com/orderers/orderer0.bceao.com/msp/tlscacerts/tlsca.bceao.com-cert.pem"

sudo chmod -R a=rwx ../chaincode-javascript/

# Fonction pour changer d'identité selon l'organisation
function switchIdentity() {
    ORG=$1
    PEER=$2
    PORT=$3
    LOWER_MSP=$(echo $ORG | tr A-Z a-z)

    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID=${ORG}MSP
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto-material/peerOrganizations/${LOWER_MSP}.bceao.com/peers/${PEER}.${LOWER_MSP}.bceao.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-material/peerOrganizations/${LOWER_MSP}.bceao.com/users/Admin@${LOWER_MSP}.bceao.com/msp
    export CORE_PEER_ADDRESS=localhost:${PORT}
}

# Fonction pour afficher l'environnement actuel de Fabric
function echoCurrentFabricEnvironment() {
    echo -e "Current environment variables and identities:"
    echo -e "${YELLOW}CORE_PEER_TLS_ENABLED=${CORE_PEER_TLS_ENABLED}"
    echo -e "CORE_PEER_LOCALMSPID=${CORE_PEER_LOCALMSPID}"
    echo -e "CORE_PEER_TLS_ROOTCERT_FILE=${CORE_PEER_TLS_ROOTCERT_FILE}"
    echo -e "CORE_PEER_MSPCONFIGPATH=${CORE_PEER_MSPCONFIGPATH}"
    echo -e "CORE_PEER_ADDRESS=${CORE_PEER_ADDRESS}${NO_COLOR}"
}

# Fonction pour packager le chaincode
function packageChaincode() {
    peer version
    sudo rm ${CHAINCODE_NAME}.tar.gz || true
    printSeparator "Packaging Chaincode"
    peer lifecycle chaincode package ${CHAINCODE_NAME}.tar.gz --path ${CHAINCODE_PATH} --lang node --label ${CHAINCODE_NAME}_${CHAINCODE_VERSION}
    echo "Accorder les permissions à" ${CHAINCODE_NAME}.tar.gz
    sudo chmod -R a=rwx ${CHAINCODE_NAME}.tar.gz
}

# Fonction pour installer le chaincode
function installChaincode() {
    printSeparator "Installing Chaincode for Org: $1 and peer $2"
    switchIdentity $1 $2 $3
    echoCurrentFabricEnvironment
    peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz
    
    if [ $? -ne 0 ]; then
        echo "Failed to install chaincode on $1 $2"
        exit 1
    fi
    
    printSeparator "Querying Installed Chaincode for Org: $1"
    peer lifecycle chaincode queryinstalled

    # Capture l'ID du package installé
    CC_PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep ${CHAINCODE_NAME}_${CHAINCODE_VERSION} | awk -F "[, ]+" '{print $3}')
    echo -e "${YELLOW}Package ID for $1: ${CC_PACKAGE_ID}${NO_COLOR}"
}

# Fonction pour approuver le chaincode pour une organisation
function approveChaincodeForOrg() {
    printSeparator "Approving Chaincode for Org: $1"
    switchIdentity $1 $2 $3
    echoCurrentFabricEnvironment
    
    peer lifecycle chaincode approveformyorg -o ${ORDERER_ADDRESS} \
        --ordererTLSHostnameOverride ${ORDERER_TLS_HOSTNAME} \
        --channelID ${CHANNEL_NAME} \
        --name ${CHAINCODE_NAME} \
        --version ${CHAINCODE_VERSION} \
        --package-id ${CC_PACKAGE_ID} \
        --sequence ${SEQUENCE} \
        --tls \
        --cafile ${ORDERER_CA}
    
    if [ $? -ne 0 ]; then
        echo "Failed to approve chaincode for $1"
        exit 1
    fi
    
    printSeparator "Checking Commit Readiness for Org: $1"
    peer lifecycle chaincode checkcommitreadiness \
        --channelID ${CHANNEL_NAME} \
        --name ${CHAINCODE_NAME} \
        --version ${CHAINCODE_VERSION} \
        --sequence ${SEQUENCE} \
        --tls \
        --cafile ${ORDERER_CA} \
        --output json
}

# Fonction pour valider et commit le chaincode sur le canal
function commitChaincode() {
    printSeparator "Committing Chaincode"
    peer lifecycle chaincode commit -o ${ORDERER_ADDRESS} \
        --ordererTLSHostnameOverride ${ORDERER_TLS_HOSTNAME} \
        --channelID ${CHANNEL_NAME} \
        --name ${CHAINCODE_NAME} \
        --version ${CHAINCODE_VERSION} \
        --sequence ${SEQUENCE} \
        --tls \
        --cafile ${ORDERER_CA} \
        --peerAddresses localhost:7051 \
        --tlsRootCertFiles ${PWD}/crypto-material/peerOrganizations/ecobank.bceao.com/peers/peer0.ecobank.bceao.com/tls/ca.crt \
        --peerAddresses localhost:8051 \
        --tlsRootCertFiles ${PWD}/crypto-material/peerOrganizations/corisbank.bceao.com/peers/peer0.corisbank.bceao.com/tls/ca.crt
    
    if [ $? -ne 0 ]; then
        echo "Failed to commit chaincode"
        exit 1
    fi
    
    printSeparator "Querying Committed Chaincode"
    peer lifecycle chaincode querycommitted \
        --channelID ${CHANNEL_NAME} \
        --name ${CHAINCODE_NAME}
}

# Fonction pour afficher un séparateur pour une meilleure lisibilité
function printSeparator() {
    echo -e "${GREEN}"
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' +
    echo -e "$1"
    printf '%*s\n' "${COLUMNS:-$(tput cols)}" '' | tr ' ' +
    echo -e "${NO_COLOR}"
}

# Exécution principale
printSeparator "Starting Chaincode Deployment"

# Préparation de l'environnement
preSetupJavaScript

# Package du chaincode
packageChaincode

# Installation sur tous les peers
printSeparator "Installing on All Peers"

# Ecobank peers
installChaincode "Ecobank" "peer0" 7051
#installChaincode "Ecobank" "peer1" 7042

# Corisbank peers
installChaincode "Corisbank" "peer0" 8051
#installChaincode "Corisbank" "peer1" 8042

# Approbation par les organisations
approveChaincodeForOrg "Ecobank" "peer0" 7051
approveChaincodeForOrg "Corisbank" "peer0" 8051

# Commit final
commitChaincode

printSeparator "Chaincode Deployment Complete"

# Vérification finale
printSeparator "Final Verification"
peer lifecycle chaincode querycommitted \
    --channelID ${CHANNEL_NAME} \
    --name ${CHAINCODE_NAME} \
    --output json
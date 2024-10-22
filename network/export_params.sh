#!/bin/bash

export FABRIC_CFG_PATH=${PWD}/config

# Set environment variables for Fabric network
export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/crypto-material/ordererOrganizations/bceao.com/orderers/orderer0.bceao.com/msp/tlscacerts/tlsca.bceao.com-cert.pem
export CORE_PEER_LOCALMSPID=EcobankMSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto-material/peerOrganizations/ecobank.bceao.com/peers/peer0.ecobank.bceao.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-material/peerOrganizations/ecobank.bceao.com/users/Admin@ecobank.bceao.com/msp
export CORE_PEER_ADDRESS=localhost:7051

export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/crypto-material/ordererOrganizations/bceao.com/orderers/orderer0.bceao.com/msp/tlscacerts/tlsca.bceao.com-cert.pem
export CORE_PEER_LOCALMSPID=CorisbankMSP
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/crypto-material/peerOrganizations/corisbank.bceao.com/peers/peer0.corisbank.bceao.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/crypto-material/peerOrganizations/corisbank.bceao.com/users/Admin@corisbank.bceao.com/msp
export CORE_PEER_ADDRESS=localhost:8051

# Print a message indicating successful variable setup
echo "Fabric network environment variables set."
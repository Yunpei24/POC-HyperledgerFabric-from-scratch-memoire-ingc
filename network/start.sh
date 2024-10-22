#!/bin/bash

export PATH=${PWD}/../fabric-samples/bin:${PATH}
export FABRIC_CFG_PATH=${PWD}/config
export IMAGE_TAG=2.1

. ./utils.sh
printSeparator "Generate crypto-material for Ecobank"
cryptogen generate --config=./cryptogen-input/crypto-config-ecobank.yaml --output="crypto-material"

printSeparator "Generate crypto-material for Corisbank"
cryptogen generate --config=./cryptogen-input/crypto-config-corisbank.yaml --output="crypto-material"

printSeparator "Generate crypto-material for Orderer"
cryptogen generate --config=./cryptogen-input/crypto-config-orderer.yaml --output="crypto-material"

printSeparator "Create Genesis-Block"
configtxgen -profile ApNetworkProfile -configPath ${PWD}/config -channelID system-channel -outputBlock ./system-genesis-block/genesis.block

printSeparator "Start Network within Docker Containers"
docker-compose -f ./docker/docker-compose-orderer.yaml -f ./docker/docker-compose-ecobank.yaml -f ./docker/docker-compose-corisbank.yaml up -d

printSeparator "Create Channel Transaction"
configtxgen -profile ApChannelProfile -configPath ${PWD}/config -outputCreateChannelTx ./channel-artifacts/bceaochannel.tx -channelID bceaochannel && sleep 3

printSeparator "Create Anchor Peers Update for Ecobank"
configtxgen -profile ApChannelProfile -configPath ${PWD}/config -outputAnchorPeersUpdate ./channel-artifacts/EcobankMSPanchors.tx -channelID bceaochannel -asOrg Ecobank

printSeparator "Create Anchor Peers Update for Corisbank"
configtxgen -profile ApChannelProfile -configPath ${PWD}/config -outputAnchorPeersUpdate ./channel-artifacts/CorisbankMSPanchors.tx -channelID bceaochannel -asOrg Corisbank
printSeparator "Wait 3 seconds for network to come up" && sleep 3

# ----------------------------------ECOBANK--------------------------------------------#
printSeparator "Set Identity to peer0 of Ecobank"
switchIdentity "Ecobank" 7051 "peer0" && echoCurrentFabricEnvironment

printSeparator "Create channel"
peer channel create -o localhost:7050 -c bceaochannel --ordererTLSHostnameOverride orderer0.bceao.com -f ./channel-artifacts/bceaochannel.tx --outputBlock ./channel-artifacts/bceaochannel.block --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA

printSeparator "Join Ecobank to channel"
peer channel join -b ./channel-artifacts/bceaochannel.block && sleep 1

printSeparator "Update Anchor Peers as Ecobank"
peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer0.bceao.com -c bceaochannel -f ./channel-artifacts/EcobankMSPanchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA

printSeparator "Set Identity to peer1 of Ecobank"
switchIdentity "Ecobank" 7042 "peer1" && echoCurrentFabricEnvironment

printSeparator "Join Ecobank to channel"
peer channel join -b ./channel-artifacts/bceaochannel.block && sleep 1

# ----------------------------------CORISBANK--------------------------------------------#
printSeparator "Set Identity to peer0 of Corisbank"
switchIdentity "Corisbank" 8051 "peer0" && echoCurrentFabricEnvironment && sleep 1

printSeparator "Join Corisbank to channel"
peer channel join -b ./channel-artifacts/bceaochannel.block

printSeparator "Update Anchor Peers as Corisbank"
peer channel update -o localhost:7050 --ordererTLSHostnameOverride orderer0.bceao.com -c bceaochannel -f ./channel-artifacts/CorisbankMSPanchors.tx --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA

printSeparator "Set Identity to peer1 of Corisbank"
switchIdentity "Corisbank" 8042 "peer1" && echoCurrentFabricEnvironment && sleep 1

printSeparator "Join Corisbank to channel"
peer channel join -b ./channel-artifacts/bceaochannel.block

sudo cp -r ./crypto-material ../explorer
printSeparator "Done!"
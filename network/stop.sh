#!/bin/bash

COMPOSE_FILES="-f ./docker/docker-compose-ecobank.yaml -f ./docker/docker-compose-corisbank.yaml -f ./docker/docker-compose-orderer.yaml -f ./docker/docker-compose-bceaoorg.yaml"
IMAGE_TAG=$IMAGETAG docker-compose ${COMPOSE_FILES} down --volumes --remove-orphans

rm -rf ./crypto-material/*
rm -rf ./system-genesis-block/*
rm -rf ./channel-artifacts/*
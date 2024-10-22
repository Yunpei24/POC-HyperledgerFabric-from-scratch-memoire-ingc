#!/bin/bash

# Set the path to your cryptogen binary (adjust if needed)
CRYPTOGEN_BIN=cryptogen

# Generate crypto material for Ecobank
$CRYPTOGEN_BIN generate --config=./cryptogen-input/crypto-config-ecobank.yaml --output="crypto-material"
# Generate crypto material for Corisbank
$CRYPTOGEN_BIN generate --config=./cryptogen-input/crypto-config-corisbank.yaml --output="crypto-material"

# Generate crypto material for the Orderer
$CRYPTOGEN_BIN generate --config=./cryptogen-input/crypto-config-orderer.yaml --output="crypto-material"

# Print a success message
echo "Cryptographic materials generated successfully!"
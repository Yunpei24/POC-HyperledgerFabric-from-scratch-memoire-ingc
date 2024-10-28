// backend/src/fabric/network.js
const { Gateway, connect, signers } = require('@hyperledger/fabric-gateway');
const grpc = require('@grpc/grpc-js');
const { promises: fs } = require('fs');
const path = require('path');
const crypto = require('crypto');

const config = require('../../config/connection.json');
const constants = require('../../config/constants');

async function connectToNetwork() {
    try {
        // Charger les certificats et la clé privée
        const { certificate, privateKey } = await loadCredentials();
        
        // Créer le client gRPC
        const client = await createGrpcClient();
        
        console.log('Connexion au réseau...');

        // Créer le signer avec la classe Signers de fabric-gateway
        const sign = signers.newPrivateKeySigner(crypto.createPrivateKey(privateKey));

        // Créer une gateway avec l'identité et le signer
        const gateway = connect({
            client,
            identity: {
                mspId: constants.MSP_ID,
                credentials: Buffer.from(certificate)
            },
            signer: sign,
            evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
            endorseOptions: () => ({ deadline: Date.now() + 15000 }),
            submitOptions: () => ({ deadline: Date.now() + 5000 }),
            commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
        });

        // Se connecter au réseau et au contrat
        console.log('Connexion au channel:', constants.CHANNEL_NAME);
        const network = gateway.getNetwork(constants.CHANNEL_NAME);
        console.log('Connexion au chaincode:', constants.CHAINCODE_NAME);
        const contract = network.getContract(constants.CHAINCODE_NAME);

        console.log('Connexion réussie !');
        return { gateway, contract };
    } catch (error) {
        console.error('Erreur de connexion au réseau:', error);
        throw error;
    }
}

async function loadCredentials() {
    try {
        const cryptoPath = path.resolve(__dirname, '..', '..', '..', 'crypto-material');
        
        const certPath = path.join(
            cryptoPath,
            'peerOrganizations/ecobank.bceao.com/users/Admin@ecobank.bceao.com/msp/signcerts/Admin@ecobank.bceao.com-cert.pem'
        );
        
        const keystorePath = path.join(
            cryptoPath,
            'peerOrganizations/ecobank.bceao.com/users/Admin@ecobank.bceao.com/msp/keystore'
        );

        // Lire le contenu du dossier keystore
        const keystoreFiles = await fs.readdir(keystorePath);
        if (keystoreFiles.length === 0) {
            throw new Error('Aucun fichier trouvé dans le keystore');
        }

        const keyPath = path.join(keystorePath, keystoreFiles[0]);

        // Lire les certificats
        const [certificate, privateKey] = await Promise.all([
            fs.readFile(certPath),
            fs.readFile(keyPath)
        ]);

        return {
            certificate: certificate.toString(),
            privateKey: privateKey.toString()
        };
    } catch (error) {
        console.error('Erreur lors du chargement des credentials:', error);
        throw error;
    }
}

async function createGrpcClient() {
    try {
        const cryptoPath = path.resolve(__dirname, '..', '..', '..', 'crypto-material');
        const tlsCertPath = path.join(
            cryptoPath,
            'peerOrganizations/ecobank.bceao.com/peers/peer0.ecobank.bceao.com/tls/ca.crt'
        );
        
        const tlsRootCert = await fs.readFile(tlsCertPath);
        const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);

        return new grpc.Client(
            'localhost:7051',
            tlsCredentials,
            {
                'grpc.ssl_target_name_override': 'peer0.ecobank.bceao.com',
                'grpc.max_receive_message_length': -1,
                'grpc.max_send_message_length': -1
            }
        );
    } catch (error) {
        console.error('Erreur lors de la création du client gRPC:', error);
        throw error;
    }
}

module.exports = {
    connectToNetwork
};
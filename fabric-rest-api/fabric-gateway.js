const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

class FabricGateway {
    constructor() {
        this.connection = null;
        this.network = null;
        this.contract = null;
    }

    async connect(orgName = 'Ecobank', userId = 'Admin') {
        try {
            // Charger le profil de connexion
            const ccpPath = path.resolve(__dirname, 'connection-profile.json');
            const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            // Créer un nouveau wallet en mémoire pour stocker l'identité
            const wallet = await Wallets.newInMemoryWallet();

            // Charger les certificats depuis le dossier crypto-material
            const orgLower = orgName.toLowerCase();
            const credPath = path.join(
                __dirname,
                '..',
                'crypto-material',
                'peerOrganizations',
                `${orgLower}.bceao.com`,
                'users',
                `Admin@${orgLower}.bceao.com`
            );

            const certificate = fs.readFileSync(
                path.join(credPath, 'msp/signcerts/Admin@' + orgLower + '.bceao.com-cert.pem')
            ).toString();
            const privateKey = fs.readFileSync(
                path.join(credPath, 'msp/keystore/priv_sk')
            ).toString();

            // Importer l'identité dans le wallet
            const identityLabel = `${orgName}Admin`;
            const identity = {
                credentials: {
                    certificate,
                    privateKey,
                },
                mspId: `${orgName}MSP`,
                type: 'X.509',
            };
            await wallet.put(identityLabel, identity);

            // Connecter au gateway
            const gateway = new Gateway();
            await gateway.connect(ccp, {
                wallet,
                identity: identityLabel,
                discovery: { enabled: true, asLocalhost: true }
            });

            // Obtenir le network et le contract
            this.network = await gateway.getNetwork('bceaochannel');
            this.contract = this.network.getContract('bceaochaincode');
            this.connection = gateway;

            return this.contract;
        } catch (error) {
            throw new Error(`Erreur de connexion au réseau: ${error.message}`);
        }
    }

    async disconnect() {
        if (this.connection) {
            this.connection.disconnect();
        }
    }
}

module.exports = FabricGateway;
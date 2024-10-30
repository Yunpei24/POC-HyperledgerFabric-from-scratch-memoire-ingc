// backend/src/controllers/clientController.js
const { connectToNetwork } = require('../fabric/network');
const parseResponse = require('../utils/responseParser');

class ClientController {
    // Obtenir tous les clients
    async getAllClients(req, res) {
        try {
            const { contract } = await connectToNetwork();
            console.log('Récupération de tous les clients...');
            
            const result = await contract.evaluateTransaction('GetAllClients');
            const clients = parseResponse(result);
            
            res.json(clients);
        } catch (error) {
            console.error('Erreur getAllClients:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Obtenir les clients actifs
    async getActiveClients(req, res) {
        try {
            const { contract } = await connectToNetwork();
            const result = await contract.evaluateTransaction('GetActiveClients');
            const clients = parseResponse(result);
            res.json(clients);
        } catch (error) {
            console.error('Erreur getActiveClients:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Obtenir un client spécifique
    async getClient(req, res) {
        try {
            const { contract } = await connectToNetwork();
            console.log('Lecture du client:', req.params.ubi);
            
            const result = await contract.evaluateTransaction('ReadClient', req.params.ubi);
            const client = parseResponse(result);
            
            res.json(client);
        } catch (error) {
            console.error('Erreur getClient:', error);
            res.status(error.message.includes('does not exist') ? 404 : 500)
               .json({ error: error.message });
        }
    }

    // Créer un nouveau client
    async createClient(req, res) {
        try {
            const {
                ubi,
                firstName,
                lastName,
                dateOfBirth,
                gender,
                email,
                accountList,
                nationalities,
                imageDocumentIdentification
            } = req.body;

            const { contract } = await connectToNetwork();
            
            const result = await contract.submitTransaction(
                'CreateClient',
                ubi,
                firstName,
                lastName,
                dateOfBirth,
                gender,
                email,
                JSON.stringify(accountList || []),
                JSON.stringify(nationalities || []),
                imageDocumentIdentification || ''
            );

            const createdClient = parseResponse(result);
            res.status(201).json(createdClient);
        } catch (error) {
            console.error('Erreur createClient:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Mettre à jour un client
    async updateClient(req, res) {
        try {
            const { ubi } = req.params;
            const updateData = { ...req.body };

            // Nettoyer les données avant la mise à jour
            delete updateData.UBI;
            delete updateData.accountList;
            delete updateData.docType;

            console.log('Mise à jour client:', { ubi, updateData });

            const { contract } = await connectToNetwork();
            const result = await contract.submitTransaction(
                'UpdateClientAttributes',
                ubi,
                JSON.stringify(updateData)
            );

            const updatedClient = parseResponse(result);
            res.json(updatedClient);
        } catch (error) {
            console.error('Erreur updateClient:', error);
            res.status(500).json({ 
                error: 'Erreur lors de la mise à jour',
                details: error.message 
            });
        }
    }

    // Désactiver un client
    async deactivateClient(req, res) {
        try {
            const { ubi } = req.params;
            const { contract } = await connectToNetwork();

            await contract.submitTransaction('DeactivateClient', ubi);
            res.json({ message: 'Client désactivé avec succès' });
        } catch (error) {
            console.error('Erreur deactivateClient:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Obtenir l'historique d'un client
    async getClientHistory(req, res) {
        try {
            const { ubi } = req.params;
            const { contract } = await connectToNetwork();
            
            const result = await contract.evaluateTransaction('GetClientHistory', ubi);
            const history = parseResponse(result);
            res.json(history);
        } catch (error) {
            console.error('Erreur getClientHistory:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Ajouter un compte à un client
    async addAccount(req, res) {
        try {
            const { ubi } = req.params;
            const { accountNumber, bankName } = req.body;
            const { contract } = await connectToNetwork();
            
            await contract.submitTransaction(
                'AddAccount',
                ubi,
                accountNumber,
                bankName
            );

            const updatedClientResult = await contract.evaluateTransaction('ReadClient', ubi);
            const updatedClient = parseResponse(updatedClientResult);
            res.json(updatedClient);
        } catch (error) {
            console.error('Erreur addAccount:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Mettre à jour un compte
    async updateAccount(req, res) {
        try {
            const { ubi, accountNumber } = req.params;
            const { bankName } = req.body;

            const { contract } = await connectToNetwork();

            await contract.submitTransaction(
                'UpdateAccount',
                ubi,
                accountNumber,
                bankName
            );

            const updatedClientResult = await contract.evaluateTransaction('ReadClient', ubi);
            const updatedClient = parseResponse(updatedClientResult);
            res.json(updatedClient);
        } catch (error) {
            console.error('Erreur updateAccount:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Supprimer un compte
    async removeAccount(req, res) {
        try {
            const { ubi, accountNumber } = req.params;
            const { contract } = await connectToNetwork();

            await contract.submitTransaction('RemoveAccount', ubi, accountNumber);

            const updatedClientResult = await contract.evaluateTransaction('ReadClient', ubi);
            const updatedClient = parseResponse(updatedClientResult);
            res.json(updatedClient);
        } catch (error) {
            console.error('Erreur removeAccount:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new ClientController();
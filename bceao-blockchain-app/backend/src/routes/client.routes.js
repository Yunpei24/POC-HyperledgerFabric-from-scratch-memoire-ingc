// backend/src/routes/client.routes.js
const express = require('express');
const router = express.Router();
const { connectToNetwork } = require('../fabric/network');

// Fonction utilitaire améliorée pour convertir le buffer en JSON
function parseResponse(response) {
    try {
        // Si c'est un Buffer ou un Uint8Array
        if (Buffer.isBuffer(response) || response instanceof Uint8Array) {
            const stringData = Buffer.from(response).toString('utf8');
            console.log('Données converties en string:', stringData);
            return JSON.parse(stringData);
        }
        
        // Si c'est déjà une chaîne
        if (typeof response === 'string') {
            return JSON.parse(response);
        }

        throw new Error('Format de réponse non pris en charge');
    } catch (error) {
        console.error('Erreur parsing réponse:', error);
        throw error;
    }
}

// Obtenir tous les clients
router.get('/all', async (req, res) => {
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
});

// Obtenir un client spécifique
router.get('/:ubi', async (req, res) => {
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
});

// Créer un nouveau client
router.post('/create', async (req, res) => {
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

        console.log('Création client:', { ubi, firstName, lastName, email });

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
});

// Mettre à jour un client
router.put('/:ubi', async (req, res) => {
    try {
        const { contract } = await connectToNetwork();
        console.log('Mise à jour client:', req.params.ubi, req.body);

        const result = await contract.submitTransaction(
            'UpdateClientAttributes',
            req.params.ubi,
            JSON.stringify(req.body)
        );

        const updatedClient = parseResponse(result);
        res.json(updatedClient);
    } catch (error) {
        console.error('Erreur updateClient:', error);
        res.status(500).json({ error: error.message });
    }
});

// Désactiver un client
router.delete('/:ubi', async (req, res) => {
    try {
        const { contract } = await connectToNetwork();
        console.log('Désactivation client:', req.params.ubi);

        await contract.submitTransaction('DeactivateClient', req.params.ubi);
        res.json({ message: 'Client désactivé avec succès' });
    } catch (error) {
        console.error('Erreur deactivateClient:', error);
        res.status(500).json({ error: error.message });
    }
});

// Obtenir l'historique d'un client
router.get('/:ubi/history', async (req, res) => {
    try {
        const { contract } = await connectToNetwork();
        console.log('Récupération historique client:', req.params.ubi);

        const result = await contract.evaluateTransaction('GetClientHistory', req.params.ubi);
        const history = parseResponse(result);
        
        res.json(history);
    } catch (error) {
        console.error('Erreur getClientHistory:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ajouter un compte à un client
router.post('/:ubi/accounts', async (req, res) => {
    try {
        const { accountNumber, bankName } = req.body;
        const { contract } = await connectToNetwork();
        
        console.log('Ajout compte:', { ubi: req.params.ubi, accountNumber, bankName });

        await contract.submitTransaction(
            'AddAccount',
            req.params.ubi,
            accountNumber,
            bankName
        );

        // Récupérer le client mis à jour
        const updatedClientResult = await contract.evaluateTransaction('ReadClient', req.params.ubi);
        const updatedClient = parseResponse(updatedClientResult);
        
        res.json(updatedClient);
    } catch (error) {
        console.error('Erreur addAccount:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const FabricGateway = require('../fabric-gateway');
const { validateClient } = require('../middleware/validation');

const fabricGateway = new FabricGateway();

// Récupérer tous les clients
router.get('/', async (req, res) => {
    try {
        const contract = await fabricGateway.connect('Ecobank', 'admin');
        const result = await contract.evaluateTransaction('GetAllClients');
        const clients = JSON.parse(result.toString());
        res.json({ success: true, data: clients });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    } finally {
        await fabricGateway.disconnect();
    }
});

// Récupérer un client par son UBI
router.get('/:ubi', async (req, res) => {
    try {
        const contract = await fabricGateway.connect('Ecobank', 'admin');
        const result = await contract.evaluateTransaction('ReadClient', req.params.ubi);
        const client = JSON.parse(result.toString());
        res.json({ success: true, data: client });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    } finally {
        await fabricGateway.disconnect();
    }
});

// Créer un nouveau client
router.post('/', validateClient, async (req, res) => {
    try {
        const {
            ubi, firstName, lastName, dateOfBirth, gender, email,
            accountList, isActive, nationality, imageDocumentIdentification
        } = req.body;

        const contract = await fabricGateway.connect('Ecobank', 'admin');
        await contract.submitTransaction(
            'CreateClient',
            ubi, firstName, lastName, dateOfBirth, gender, email,
            JSON.stringify(accountList), isActive,
            JSON.stringify(nationality), imageDocumentIdentification
        );

        res.status(201).json({
            success: true,
            message: 'Client créé avec succès'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    } finally {
        await fabricGateway.disconnect();
    }
});

// Mettre à jour un client
router.put('/:ubi', async (req, res) => {
    try {
        const contract = await fabricGateway.connect('Ecobank', 'admin');
        await contract.submitTransaction(
            'UpdateClient',
            req.params.ubi,
            JSON.stringify(req.body)
        );

        res.json({
            success: true,
            message: 'Client mis à jour avec succès'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    } finally {
        await fabricGateway.disconnect();
    }
});

// Supprimer un client
router.delete('/:ubi', async (req, res) => {
    try {
        const contract = await fabricGateway.connect('Ecobank', 'admin');
        await contract.submitTransaction('DeleteClient', req.params.ubi);
        res.json({
            success: true,
            message: 'Client supprimé avec succès'
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    } finally {
        await fabricGateway.disconnect();
    }
});

module.exports = router;
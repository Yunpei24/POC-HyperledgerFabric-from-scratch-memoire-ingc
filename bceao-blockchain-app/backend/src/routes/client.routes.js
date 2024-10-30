// backend/src/routes/client.routes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const verifyToken = require('../middleware/auth');

// Protéger toutes les routes avec le middleware d'authentification
router.use(verifyToken);

// Routes de base pour les clients
router.get('/all', clientController.getAllClients);
router.get('/active', clientController.getActiveClients);
router.get('/:ubi', clientController.getClient);
router.post('/create', clientController.createClient);
router.put('/:ubi', clientController.updateClient);
router.delete('/:ubi', clientController.deactivateClient);

// Routes pour l'historique
router.get('/:ubi/history', clientController.getClientHistory);

// Routes pour la gestion des comptes
router.post('/:ubi/accounts', clientController.addAccount);
router.put('/:ubi/accounts/:accountNumber', clientController.updateAccount);
router.delete('/:ubi/accounts/:accountNumber', clientController.removeAccount);

module.exports = router;
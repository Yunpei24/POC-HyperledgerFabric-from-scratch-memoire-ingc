// backend/src/routes/client.routes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const verifyToken = require('../middleware/auth');

// Middleware pour vérifier la taille et le format de l'image
const validateImage = (req, res, next) => {
    if (req.body.imageDocumentIdentification) {
        // Vérifier le format base64
        if (!req.body.imageDocumentIdentification.match(/^data:image\/(jpeg|png|jpg);base64,/)) {
            return res.status(400).json({ 
                error: 'Format d\'image invalide. Utilisez JPEG, PNG ou JPG en base64' 
            });
        }

        // Vérifier la taille (max 2MB)
        const base64Data = req.body.imageDocumentIdentification.split(',')[1];
        const sizeInBytes = Buffer.from(base64Data, 'base64').length;
        if (sizeInBytes > 2 * 1024 * 1024) {
            return res.status(400).json({ 
                error: 'Image trop grande. Taille maximale: 2MB' 
            });
        }
    }
    next();
};


// Protéger toutes les routes avec le middleware d'authentification
router.use(verifyToken);

// Routes de base pour les clients
router.get('/all', clientController.getAllClients);
router.get('/active', clientController.getActiveClients);
router.get('/:ubi', clientController.getClient);
router.post('/create', clientController.createClient);
router.put('/:ubi', clientController.updateClient);
router.put('/:ubi/rejetdemande', clientController.rejetDemande);
router.put('/:ubi/activate', clientController.activateClient);
router.delete('/:ubi/deactivate', clientController.deactivateClient);
router.post('/:ubi/nationalities', clientController.addNationality);
router.delete('/:ubi/nationalities/:countryName', clientController.removeNationality);


// Route pour l'image
router.get('/:ubi/image', clientController.getClientImage);

// Routes pour l'historique
router.get('/:ubi/history', clientController.getClientHistory);

// Routes pour la gestion des comptes
router.post('/:ubi/accounts', clientController.addAccount);
router.put('/:ubi/accounts/:accountNumber', clientController.updateAccount);
router.delete('/:ubi/accounts/:accountNumber', clientController.removeAccount);

module.exports = router;
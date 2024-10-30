// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    try {
        // Récupérer le token du header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: 'Accès non autorisé' });
        }

        // Vérifier le token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Token invalide' });
            }

            // Ajouter les informations de l'utilisateur à la requête
            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        res.status(401).json({ error: 'Erreur d\'authentification' });
    }
};

module.exports = verifyToken;
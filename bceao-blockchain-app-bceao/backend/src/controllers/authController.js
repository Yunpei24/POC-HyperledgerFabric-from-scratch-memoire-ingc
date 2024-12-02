// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Pour le développement, nous utilisons des utilisateurs en dur
const users = {
    'admin_bceao': {
        username: 'admin_bceao',
        password: 'admin123',
        organization: 'BCEAOORG',
        role: 'admin'
    }
};


class AuthController {
    async login(req, res) {
        try {
            const { username, password } = req.body;

            // Vérifier si l'utilisateur existe
            const user = users[username];
            if (!user) {
                return res.status(401).json({ 
                    error: 'Identifiants invalides' 
                });
            }

            // Vérifier le mot de passe
            if (password !== user.password) {
                return res.status(401).json({ 
                    error: 'Identifiants invalides' 
                });
            }

            // Générer le token JWT avec la clé secrète de l'environnement
            const token = jwt.sign(
                {
                    username: user.username,
                    organization: user.organization,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Retourner les informations de l'utilisateur et le token
            res.json({
                username: user.username,
                organization: user.organization,
                role: user.role,
                token
            });
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            res.status(500).json({ error: 'Erreur de connexion' });
        }
    }
}

module.exports = new AuthController();
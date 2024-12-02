// backend/src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const clientRoutes = require('./routes/client.routes');
const authRoutes = require('./routes/auth.routes');
const constants = require('../config/constants');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Route de test
app.get('/test', (req, res) => {
    res.json({ message: 'API BCEAO Blockchain fonctionne!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erreur serveur' });
});

const PORT = constants.PORT || process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;
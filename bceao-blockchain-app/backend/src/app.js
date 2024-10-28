const express = require('express');
const cors = require('cors');
const clientRoutes = require('./routes/client.routes');
const constants = require('../config/constants');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/clients', clientRoutes);

// Route de test simple
app.get('/test', (req, res) => {
    res.json({ message: 'API BCEAO Blockchain fonctionne!' });
});

// Démarrage du serveur
app.listen(constants.PORT, () => {
    console.log(`Serveur démarré sur le port ${constants.PORT}`);
});

module.exports = app;
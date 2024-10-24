const express = require('express');
const bodyParser = require('body-parser');
const FabricGateway = require('./fabric-gateway');
const clientRoutes = require('./routes/client-routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware pour la gestion des erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Une erreur est survenue',
        error: err.message
    });
});

// Routes
app.use('/api/clients', clientRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
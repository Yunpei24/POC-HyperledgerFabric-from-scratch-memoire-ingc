#!/bin/bash

# Définir les couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour créer un fichier avec un contenu initial
create_file() {
    local file=$1
    local content=$2
    echo -e "$content" > "$file"
    echo -e "${BLUE}Créé${NC}: $file"
}

# Fonction pour créer un dossier
create_dir() {
    local dir=$1
    mkdir -p "$dir"
    echo -e "${GREEN}Créé${NC}: $dir"
}

# Nom du projet principal
PROJECT_NAME="bceao-blockchain-app"

# Création de la structure principale
create_dir "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Structure Backend
create_dir "backend/config/connection-profiles"
create_dir "backend/config/wallets"
create_dir "backend/src/controllers"
create_dir "backend/src/fabric"
create_dir "backend/src/middleware"
create_dir "backend/src/routes"
create_dir "backend/src/utils"

# Création des fichiers backend
create_file "backend/config/connection-profiles/connection.json" '{
    "name": "bceao-network",
    "version": "1.0.0"
}'

create_file "backend/src/controllers/authController.js" '// Gestion de l authentification
const authController = {
    login: async (req, res) => {
        // TODO: Implémentation
    }
};
module.exports = authController;'

create_file "backend/src/controllers/clientController.js" '// Gestion des clients
const clientController = {
    getAllClients: async (req, res) => {
        // TODO: Implémentation
    }
};
module.exports = clientController;'

create_file "backend/src/fabric/fabric-connection.js" '// Configuration de la connexion Fabric
const FabricConnection = {
    connect: async () => {
        // TODO: Implémentation
    }
};
module.exports = FabricConnection;'

create_file "backend/src/fabric/wallet.js" '// Gestion du wallet
const WalletManager = {
    init: async () => {
        // TODO: Implémentation
    }
};
module.exports = WalletManager;'

create_file "backend/src/middleware/auth.js" '// Middleware d authentification
const authMiddleware = async (req, res, next) => {
    // TODO: Implémentation
    next();
};
module.exports = authMiddleware;'

create_file "backend/src/middleware/validation.js" '// Validation des données
const validate = (schema) => async (req, res, next) => {
    // TODO: Implémentation
    next();
};
module.exports = validate;'

create_file "backend/src/routes/auth.routes.js" 'const express = require("express");
const router = express.Router();
// TODO: Ajouter les routes
module.exports = router;'

create_file "backend/src/routes/client.routes.js" 'const express = require("express");
const router = express.Router();
// TODO: Ajouter les routes
module.exports = router;'

create_file "backend/src/utils/logger.js" '// Système de logging
const logger = {
    info: (message) => console.log(message),
    error: (message) => console.error(message)
};
module.exports = logger;'

create_file "backend/src/utils/response.js" '// Formattage des réponses
const formatResponse = (success, data, message) => ({
    success,
    data,
    message
});
module.exports = formatResponse;'

create_file "backend/src/app.js" 'const express = require("express");
const app = express();
// TODO: Configuration de l application
module.exports = app;'

create_file "backend/.env" '# Variables d environnement Backend
PORT=3000
NODE_ENV=development'

create_file "backend/package.json" '{
    "name": "bceao-blockchain-backend",
    "version": "1.0.0",
    "main": "src/app.js",
    "scripts": {
        "start": "node src/app.js",
        "dev": "nodemon src/app.js"
    }
}'

# Structure Frontend
create_dir "frontend/public/assets/images"
create_dir "frontend/public/assets/styles"
create_dir "frontend/src/components/common"
create_dir "frontend/src/components/layout"
create_dir "frontend/src/components/pages"
create_dir "frontend/src/context"
create_dir "frontend/src/hooks"
create_dir "frontend/src/services"
create_dir "frontend/src/utils"

# Création des fichiers frontend
create_file "frontend/public/index.html" '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>BCEAO Blockchain App</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>'

create_file "frontend/src/App.js" 'import React from "react";
function App() {
    return (
        <div>
            <h1>BCEAO Blockchain App</h1>
        </div>
    );
}
export default App;'

create_file "frontend/src/index.js" 'import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);'

create_file "frontend/.env" '# Variables d environnement Frontend
REACT_APP_API_URL=http://localhost:3000/api'

create_file "frontend/package.json" '{
    "name": "bceao-blockchain-frontend",
    "version": "1.0.0",
    "private": true,
    "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-scripts": "5.0.1"
    },
    "scripts": {
        "start": "react-scripts start",
        "build": "react-scripts build"
    }
}'

create_file "README.md" '# BCEAO Blockchain App

Application blockchain pour la BCEAO utilisant Hyperledger Fabric.

## Structure du Projet

- `backend/` : API REST et intégration Fabric
- `frontend/` : Interface utilisateur React

## Installation

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## Démarrage

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```'

echo -e "${GREEN}Structure du projet créée avec succès !${NC}"

# Rendre le script exécutable
chmod +x "$0"
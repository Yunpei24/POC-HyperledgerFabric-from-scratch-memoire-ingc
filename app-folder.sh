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
create_dir "backend/config"
create_dir "backend/src/fabric"
create_dir "backend/src/routes"

# Création des fichiers backend
create_file "backend/config/connection.json" '{
    "name": "bceao-network",
    "version": "1.0.0",
    "client": {
        "organization": "Ecobank",
        "connection": {
            "timeout": {
                "peer": {
                    "endorser": "300"
                },
                "orderer": "300"
            }
        }
    },
    "channels": {
        "bceaochannel": {
            "orderers": ["orderer0.bceao.com"],
            "peers": {
                "peer0.ecobank.bceao.com": {
                    "endorsingPeer": true,
                    "chaincodeQuery": true,
                    "ledgerQuery": true,
                    "eventSource": true
                }
            }
        }
    }
}'

create_file "backend/config/constants.js" '// Constants for the application
module.exports = {
    CHANNEL_NAME: "bceaochannel",
    CHAINCODE_NAME: "bceaochaincode",
    ORG_MSP: "EcobankMSP",
    ORG_NAME: "Ecobank",
    PEER_NAME: "peer0.ecobank.bceao.com",
    PEER_PORT: 7051
};'

create_file "backend/src/fabric/network.js" 'const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");

class FabricNetwork {
    async connectNetwork() {
        try {
            // load the network configuration
            const ccpPath = path.resolve(__dirname, "../../config/connection.json");
            const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));

            // Create a new file system based wallet for managing identities.
            const walletPath = path.join(process.cwd(), "wallet");
            const wallet = await Wallets.newFileSystemWallet(walletPath);

            // Create a new gateway for connecting to our peer node.
            const gateway = new Gateway();
            await gateway.connect(ccp, {
                wallet,
                identity: "admin",
                discovery: { enabled: true, asLocalhost: true }
            });

            return gateway;
        } catch (error) {
            console.error(`Failed to connect to network: ${error}`);
            throw error;
        }
    }
}

module.exports = new FabricNetwork();'

create_file "backend/src/routes/client.routes.js" 'const express = require("express");
const router = express.Router();
const network = require("../fabric/network");

// Get all clients
router.get("/", async (req, res) => {
    try {
        const gateway = await network.connectNetwork();
        const network = await gateway.getNetwork("bceaochannel");
        const contract = network.getContract("bceaochaincode");
        
        const result = await contract.evaluateTransaction("GetAllClients");
        res.json({ success: true, data: JSON.parse(result.toString()) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;'

create_file "backend/src/app.js" 'const express = require("express");
const cors = require("cors");
const clientRoutes = require("./routes/client.routes");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/clients", clientRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});'

create_file "backend/package.json" '{
    "name": "bceao-blockchain-backend",
    "version": "1.0.0",
    "main": "src/app.js",
    "scripts": {
        "start": "node src/app.js",
        "dev": "nodemon src/app.js"
    },
    "dependencies": {
        "cors": "^2.8.5",
        "express": "^4.18.2",
        "fabric-network": "^2.2.19"
    },
    "devDependencies": {
        "nodemon": "^2.0.22"
    }
}'

# Structure Frontend
create_dir "frontend/public"
create_dir "frontend/src/components"

# Création des fichiers frontend
create_file "frontend/public/index.html" '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BCEAO Blockchain App</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>'

create_file "frontend/src/components/ClientForm.js" 'import React, { useState } from "react";

const ClientForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        ubi: "",
        firstName: "",
        lastName: "",
        email: ""
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="UBI"
                value={formData.ubi}
                onChange={(e) => setFormData({...formData, ubi: e.target.value})}
            />
            <button type="submit">Soumettre</button>
        </form>
    );
};

export default ClientForm;'

create_file "frontend/src/components/ClientList.js" 'import React, { useEffect, useState } from "react";

const ClientList = () => {
    const [clients, setClients] = useState([]);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/clients");
            const data = await response.json();
            if (data.success) {
                setClients(data.data);
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
        }
    };

    return (
        <div>
            <h2>Liste des Clients</h2>
            <ul>
                {clients.map((client) => (
                    <li key={client.ubi}>{client.firstName} {client.lastName}</li>
                ))}
            </ul>
        </div>
    );
};

export default ClientList;'

create_file "frontend/src/App.js" 'import React from "react";
import ClientForm from "./components/ClientForm";
import ClientList from "./components/ClientList";

function App() {
    const handleSubmit = async (formData) => {
        try {
            const response = await fetch("http://localhost:3000/api/clients", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div>
            <h1>BCEAO Blockchain App</h1>
            <ClientForm onSubmit={handleSubmit} />
            <ClientList />
        </div>
    );
};

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
    },
    "browserslist": {
        "production": [
            ">0.2%",
            "not dead",
            "not op_mini all"
        ],
        "development": [
            "last 1 chrome version",
            "last 1 firefox version",
            "last 1 safari version"
        ]
    }
}'

echo -e "${GREEN}Structure du projet créée avec succès !${NC}"
echo -e "${BLUE}Pour démarrer le projet :${NC}"
echo -e "1. Backend : cd backend && npm install && npm start"
echo -e "2. Frontend : cd frontend && npm install && npm start"

# Rendre le script exécutable
chmod +x "$0"
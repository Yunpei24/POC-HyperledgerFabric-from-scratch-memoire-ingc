// backend/src/controllers/clientController.js
const { connectToNetwork } = require('../fabric/network');
const parseResponse = require('../utils/responseParser');

class ClientController {
    // Obtenir tous les clients
    async getAllClients(req, res) {
        try {
            const { contract } = await connectToNetwork();
            console.log('Récupération de tous les clients...');
            
            const result = await contract.evaluateTransaction('GetAllClients');
            const clients = parseResponse(result);
            
            res.json(clients);
            console.log('Fin de la récupération...');
        } catch (error) {
            console.error('Erreur getAllClients:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Obtenir les clients actifs
    async getActiveClients(req, res) {
        try {
            const { contract } = await connectToNetwork();
            const result = await contract.evaluateTransaction('GetActiveClients');
            const clients = parseResponse(result);
            res.json(clients);
        } catch (error) {
            console.error('Erreur getActiveClients:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Obtenir un client spécifique
    async getClient(req, res) {
        try {
            const { contract } = await connectToNetwork();
            
            const result = await contract.evaluateTransaction('ReadClient', req.params.ubi);
            const client = parseResponse(result);
            
            res.json(client);
        } catch (error) {
            console.error('Erreur getClient:', error);
            res.status(error.message.includes('does not exist') ? 404 : 500)
               .json({ error: error.message });
        }
    }

    // Créer un nouveau client
    async createClient(req, res) {
        try {
            const {
                firstName,
                lastName,
                dateOfBirth,
                gender,
                email,
                accountList,
                nationalities,
                imageFace
            } = req.body;
    
            // Formatage des données pour le chaincode
            const formattedAccountList = Array.isArray(accountList) 
                ? JSON.stringify(accountList) 
                : JSON.stringify([]);
    
            const formattedNationalities = Array.isArray(nationalities)
                ? JSON.stringify(nationalities)
                : JSON.stringify([]);
    
            console.log('Données formatées:', {
                firstName,
                lastName,
                dateOfBirth,
                gender,
                email,
                accountList: formattedAccountList,
                nationalities: formattedNationalities
            });
    
            const { contract } = await connectToNetwork();
    
            // Appel au chaincode
            const result = await contract.submitTransaction(
                'CreateClient',
                firstName || '',
                lastName || '',
                dateOfBirth || '',
                gender || '',
                email || '',
                formattedAccountList,
                formattedNationalities,
                imageFace || ''
            );
    
            try {
                // Convertir les bytes en string avant le parsing
                const resultString = Buffer.from(result).toString('utf8');
                
                const newClient = JSON.parse(resultString);
                return res.status(201).json(newClient);
            } catch (parseError) {
                console.error('Erreur parsing réponse:', parseError);
                
                // Tentative de nettoyage de la réponse
                try {
                    const cleanResult = result.toString('utf8')
                        .replace(/\u0000/g, '') // Supprime les caractères nuls
                        .replace(/[\x00-\x1F\x7F-\x9F]/g, ''); // Supprime les caractères de contrôle
                    
                    const newClient = JSON.parse(cleanResult);
                    return res.status(201).json(newClient);
                } catch (cleanError) {
                    return res.status(500).json({
                        error: 'Erreur lors du parsing de la réponse',
                        details: parseError.message,
                        rawResponse: result.toString('utf8')
                    });
                }
            }
    
        } catch (error) {
            console.error('Erreur détaillée:', error);
            return res.status(500).json({ 
                error: 'Erreur lors de la création du client',
                details: error.message 
            });
        }
    }

    async updateClient(req, res) {
        try {
            const { ubi } = req.params;
            const updateData = { ...req.body };
    
            // Supprimer les champs qui ne doivent pas être modifiés
            const excludedFields = [
                'UBI',
                'createdBy',
                'docType',
                'modificationHistory',
                'isDuplicate',
                'duplicateList',
                'accountList'  // Ajout de accountList aux champs exclus
            ];
    
            excludedFields.forEach(field => delete updateData[field]);
    
    
            const { contract } = await connectToNetwork();
    
            const result = await contract.submitTransaction(
                'UpdateClientAttributes',
                ubi,
                JSON.stringify(updateData)
            );
    
            try {
                const updatedClient = JSON.parse(Buffer.from(result).toString('utf8'));
                res.json(updatedClient);
            } catch (parseError) {
                console.error('Erreur parsing réponse:', parseError);
                res.status(500).json({ 
                    error: 'Erreur lors du parsing de la réponse',
                    details: parseError.message 
                });
            }
        } catch (error) {
            console.error('Erreur updateClient:', error);
            if (error.details && Array.isArray(error.details)) {
                return res.status(400).json({
                    error: 'Erreur de validation',
                    details: error.details.map(d => ({
                        message: d.message.replace('chaincode response 500, ', ''),
                        mspId: d.mspId
                    }))
                });
            }
            res.status(500).json({ 
                error: 'Erreur lors de la mise à jour',
                details: error.message 
            });
        }
    }

    // Méthode pour obtenir l'image d'un client
    async getClientImage(req, res) {
        try {
            const { ubi } = req.params;
            const { contract } = await connectToNetwork();
            
            const result = await contract.evaluateTransaction('ReadClient', ubi);
            const client = parseResponse(result);

            if (!client.imageDocumentIdentification) {
                return res.status(404).json({ error: 'Aucune image trouvée pour ce client' });
            }

            res.json({ 
                imageData: client.imageDocumentIdentification,
                metadata: {
                    ubi: client.UBI,
                    uploadedAt: client.createdBy?.timestamp || null
                }
            });
        } catch (error) {
            console.error('Erreur getClientImage:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Désactiver un client
    async deactivateClient(req, res) {
        try {
            const { ubi } = req.params;
            const { contract } = await connectToNetwork();

            await contract.submitTransaction('DeactivateClient', ubi);
            res.json({ message: 'Client désactivé avec succès' });
        } catch (error) {
            console.error('Erreur deactivateClient:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Activer un client
    async activateClient(req, res) {
        try {
            const { ubi } = req.params;
            const { contract } = await connectToNetwork();

            await contract.submitTransaction('ActivateClient', ubi);
            res.json({ message: 'Client activé avec succès' });
        } catch (error) {
            console.error('Erreur activateClient:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Obtenir l'historique d'un client
    async getClientHistory(req, res) {
        try {
            const { ubi } = req.params;
            const { contract } = await connectToNetwork();
            
            const result = await contract.evaluateTransaction('GetClientHistory', ubi);
            const history = parseResponse(result);
            res.json(history);
        } catch (error) {
            console.error('Erreur getClientHistory:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Ajouter un compte à un client
    async addAccount(req, res) {
        try {
            const { ubi } = req.params;
            const { accountNumber, bankName } = req.body;
            const { contract } = await connectToNetwork();
            
            await contract.submitTransaction(
                'AddAccount',
                ubi,
                accountNumber,
                bankName
            );

            const updatedClientResult = await contract.evaluateTransaction('ReadClient', ubi);
            const updatedClient = parseResponse(updatedClientResult);
            res.json(updatedClient);
        } catch (error) {
            console.error('Erreur addAccount:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Mettre à jour un compte
    async updateAccount(req, res) {
        try {
            const { ubi, accountNumber } = req.params;
            const { bankName } = req.body;

            const { contract } = await connectToNetwork();

            await contract.submitTransaction(
                'UpdateAccount',
                ubi,
                accountNumber,
                bankName
            );

            const updatedClientResult = await contract.evaluateTransaction('ReadClient', ubi);
            const updatedClient = parseResponse(updatedClientResult);
            res.json(updatedClient);
        } catch (error) {
            console.error('Erreur updateAccount:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Supprimer un compte
    async removeAccount(req, res) {
        try {
            const { ubi, accountNumber } = req.params;
            const { contract } = await connectToNetwork();

            await contract.submitTransaction('RemoveAccount', ubi, accountNumber);

            const updatedClientResult = await contract.evaluateTransaction('ReadClient', ubi);
            const updatedClient = parseResponse(updatedClientResult);
            res.json(updatedClient);
        } catch (error) {
            console.error('Erreur removeAccount:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Ajouter une nationalité à un client
    async addNationality(req, res) {
        try {
            const { ubi } = req.params;
            const { countryName, idDocument } = req.body;
            const { type, number, imageDocumentIdentification } = idDocument;

            // Validation des données requises
            if (!countryName || !type || !number || !imageDocumentIdentification) {
                return res.status(400).json({
                    error: 'Tous les champs sont requis (countryName, idType, idNumber, imageDocumentIdentification)'
                });
            }

            const { contract } = await connectToNetwork();

            // Appeler la fonction du chaincode
            await contract.submitTransaction(
                'AddNationality',
                ubi,
                countryName,
                type,
                number,
                imageDocumentIdentification
            );

            // Récupérer le client mis à jour
            const updatedClientResult = await contract.evaluateTransaction('ReadClient', ubi);
            const updatedClient = parseResponse(updatedClientResult);

            res.json(updatedClient);
        } catch (error) {
            console.error('Erreur addNationality:', error);
            res.status(500).json({ error: error.message });
        }
    }

    // Supprimer une nationalité
    async removeNationality(req, res) {
        try {
            const { ubi, countryName } = req.params;

            if (!countryName) {
                return res.status(400).json({
                    error: 'Le nom du pays est requis'
                });
            }

            const { contract } = await connectToNetwork();

            // Appeler la fonction du chaincode
            await contract.submitTransaction('RemoveNationality', ubi, countryName);

            // Récupérer le client mis à jour
            const updatedClientResult = await contract.evaluateTransaction('ReadClient', ubi);
            const updatedClient = parseResponse(updatedClientResult);

            res.json(updatedClient);
        } catch (error) {
            console.error('Erreur removeNationality:', error);
            res.status(500).json({ error: error.message });
        }
    }
}


module.exports = new ClientController();
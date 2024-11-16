/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');
// const { ClientIdentity } = require('fabric-shim');
const ClientUtils = require('../utils/clientUtils');
// const ImageUtils = require('../utils/imageUtils');

class ClientManager extends Contract {

    getTransactionTimestamp(ctx) {
        const timestamp = ctx.stub.getTxTimestamp();
        const seconds = timestamp.seconds.low;
        // Retourner uniquement la valeur en secondes, sans millisecondes
        return new Date(seconds * 1000).toISOString().split('.')[0] + 'Z';
    }

    async ClientExists(ctx, ubi) {
        const clientJSON = await ctx.stub.getState(ubi);
        return clientJSON && clientJSON.length > 0;
    }

    async InitLedger(ctx) {
        try {
            const mspId = ctx.clientIdentity.getMSPID();
            const timestamp = this.getTransactionTimestamp(ctx);
    
            // Définition des clients sans UBI préalable
            const clientsData = [
                {
                    firstName: 'Thomas',
                    lastName: 'Martin',
                    dateOfBirth: '1985-03-15',
                    gender: 'M',
                    email: 'thomas.martin@email.com',
                    accountList: [
                        { accountNumber: 'ACC001', bankName: 'BankA' }
                    ],
                    nationalities: ['SEN'],
                    imageDocumentIdentification: 'base64_encoded_image_1'
                },
                {
                    firstName: 'Marie',
                    lastName: 'Dubois',
                    dateOfBirth: '1990-07-22',
                    gender: 'F',
                    email: 'marie.dubois@email.com',
                    accountList: [
                        { accountNumber: 'ACC002', bankName: 'BankB' }
                    ],
                    nationalities: ['CIV'],
                    imageDocumentIdentification: 'base64_encoded_image_2'
                }
            ];
    
            // Créer les clients avec des UBI générés automatiquement
            for (const clientData of clientsData) {
                // Générer un UBI unique pour chaque client
                const ubi = await ClientUtils.generateUniqueUBI(ctx);
                
                // Construire l'objet client complet
                const client = {
                    UBI: ubi,
                    firstName: clientData.firstName,
                    lastName: clientData.lastName,
                    dateOfBirth: clientData.dateOfBirth,
                    gender: clientData.gender,
                    email: clientData.email,
                    accountList: clientData.accountList,
                    nationalities: clientData.nationalities,
                    imageDocumentIdentification: clientData.imageDocumentIdentification,
                    isActive: true,
                    docType: 'client',
                    createdBy: {
                        mspId: mspId,
                        timestamp: timestamp
                    },
                    modificationHistory: [{
                        mspId: mspId,
                        timestamp: timestamp,
                        action: 'CREATE'
                    }]
                };
    
                // Sauvegarder le client dans la blockchain
                await ctx.stub.putState(client.UBI, Buffer.from(stringify(sortKeysRecursive(client))));
                console.log(`Client initialisé avec UBI: ${client.UBI}`);
            }
    
            console.log('Initialisation du ledger terminée avec succès');
        } catch (error) {
            console.error('Erreur dans InitLedger:', error);
            throw error;
        }
    }

    async CreateClient(ctx, firstName, lastName, dateOfBirth, gender, email, accountList, nationalities, imageFace) {
        try {
            // Générer un UBI unique
            const ubi = await ClientUtils.generateUniqueUBI(ctx);
            const mspId = ctx.clientIdentity.getMSPID();
            const timestamp = this.getTransactionTimestamp(ctx);

            const duplicates = await ClientUtils.checkForDuplicates(ctx, firstName, lastName, dateOfBirth, email, imageFace);

            let client;

            if (duplicates.length > 0) { // Le cas où il y a des similitudes
                // Création du client
                client = {
                    UBI: ubi,
                    firstName: firstName,
                    lastName: lastName,
                    dateOfBirth: dateOfBirth,
                    gender: gender,
                    email: email,
                    accountList: JSON.parse(accountList),
                    nationalities: JSON.parse(nationalities),
                    imageFace: imageFace || '',
                    isActive: true,
                    docType: 'client',
                    createdBy: {
                        mspId: mspId,
                        timestamp: timestamp
                    },
                    modificationHistory: [{
                        mspId: mspId,
                        timestamp: timestamp,
                        action: 'CREATE'
                    }]
                };

                // Retourner directement la réponse sans sauvegarder dans la blockchain
                return JSON.stringify({
                    similitude: true,
                    potentialClient: client,
                    similarClients: duplicates
                });
            } else {
                // Création du client
                client = {
                    UBI: ubi,
                    firstName: firstName,
                    lastName: lastName,
                    dateOfBirth: dateOfBirth,
                    gender: gender,
                    email: email,
                    accountList: JSON.parse(accountList),
                    nationalities: JSON.parse(nationalities),
                    imageFace: imageFace || '',
                    isActive: true,
                    docType: 'client',
                    createdBy: {
                        mspId: mspId,
                        timestamp: timestamp
                    },
                    modificationHistory: [{
                        mspId: mspId,
                        timestamp: timestamp,
                        action: 'CREATE'
                    }]
                };
                await ctx.stub.putState(ubi, Buffer.from(stringify(sortKeysRecursive(client))));
                return JSON.stringify({
                    similitude: false,
                    client: client,
                    similarClients: []
                });
            }
        } catch (error) {
            console.error('Erreur dans CreateClient:', error);
            throw error;
        }
    }
    
    async ReadClient(ctx, ubi) {
        try {
            console.log('Lecture du client:', ubi);
            const clientJSON = await ctx.stub.getState(ubi);
            if (!clientJSON || clientJSON.length === 0) {
                throw new Error(`Le client avec l'UBI ${ubi} n'existe pas`);
            }

            // Ajouter une entrée dans l'historique pour la lecture
            const client = JSON.parse(clientJSON.toString());
            const mspId = ctx.clientIdentity.getMSPID();
            
            // Facultatif : on peut ajouter la lecture à l'historique
            client.modificationHistory = [
                ...(client.modificationHistory || []),
                {
                    mspId: mspId,
                    timestamp: new Date().toISOString(),
                    action: 'READ'
                }
            ];

            // Mise à jour de l'état avec la nouvelle entrée d'historique
            await ctx.stub.putState(ubi, Buffer.from(stringify(sortKeysRecursive(client))));
            
            return JSON.stringify(client);
        } catch (error) {
            console.error('Erreur dans ReadClient:', error);
            throw error;
        }
    }

    async GetAllClients(ctx) {
        try {
            const allResults = [];
            const iterator = await ctx.stub.getStateByRange('', '');
            
            while (true) {
                const result = await iterator.next();
                if (result.done) {
                    break;
                }

                const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
                let record;
                try {
                    record = JSON.parse(strValue);
                    // Ne retourner que les documents de type 'client'
                    if (record.docType === 'client') {
                        // Ajouter des métadonnées sur la requête
                        record.queryMetadata = {
                            queriedBy: {
                                mspId: ctx.clientIdentity.getMSPID(),
                                timestamp: new Date().toISOString()
                            }
                        };
                        allResults.push(record);
                    }
                } catch (err) {
                    console.log('Erreur lors du parsing:', err);
                    record = strValue;
                }
            }
            
            await iterator.close();

            // Trier les résultats par UBI pour une présentation cohérente
            allResults.sort((a, b) => a.UBI.localeCompare(b.UBI));
            
            return JSON.stringify(allResults);
        } catch (error) {
            console.error('Erreur dans GetAllClients:', error);
            throw error;
        }
    }

    async GetActiveClients(ctx) {
        try {
            const allResults = [];
            const iterator = await ctx.stub.getStateByRange('', '');
            const mspId = ctx.clientIdentity.getMSPID();
            const queryTimestamp = new Date().toISOString();
            
            while (true) {
                const result = await iterator.next();
                if (result.done) {
                    break;
                }

                const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
                try {
                    const record = JSON.parse(strValue);
                    // Ne retourner que les clients actifs
                    if (record.docType === 'client' && record.isActive === true) {
                        // Ajouter des métadonnées sur la requête
                        record.queryMetadata = {
                            queriedBy: {
                                mspId: mspId,
                                timestamp: queryTimestamp
                            },
                            filter: 'ACTIVE_ONLY'
                        };
                        allResults.push(record);
                    }
                } catch (err) {
                    console.log('Erreur lors du parsing:', err);
                }
            }
            
            await iterator.close();

            // Enrichir la réponse avec des métadonnées
            const response = {
                queryInfo: {
                    timestamp: queryTimestamp,
                    querier: mspId,
                    totalResults: allResults.length
                },
                clients: allResults.sort((a, b) => a.UBI.localeCompare(b.UBI))
            };
            
            return JSON.stringify(response);
        } catch (error) {
            console.error('Erreur dans GetActiveClients:', error);
            throw error;
        }
    }

    // Modification de UpdateClient
    async UpdateClient(ctx, ubi, firstName, lastName, dateOfBirth, gender, email, accountList, nationalities, imageDocumentIdentification) {
        const exists = await this.ClientExists(ctx, ubi);
        if (!exists) {
            throw new Error(`Le client avec l'UBI ${ubi} n'existe pas`);
        }
    
        // Récupérer le client existant
        const clientString = await this.ReadClient(ctx, ubi);
        const existingClient = JSON.parse(clientString);
    
        const mspId = ctx.clientIdentity.getMSPID();
        const timestamp = this.getTransactionTimestamp(ctx);
    
        const updatedClient = {
            ...existingClient,
            UBI: ubi,
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            gender: gender,
            email: email,
            accountList: JSON.parse(accountList),
            nationalities: nationalities,
            imageDocumentIdentification: imageDocumentIdentification,
            isActive: true,
            docType: 'client',
            modificationHistory: [
                ...(existingClient.modificationHistory || []),
                {
                    mspId: mspId,
                    timestamp: timestamp,
                    action: 'UPDATE'
                }
            ]
        };
    
        await ctx.stub.putState(ubi, Buffer.from(stringify(sortKeysRecursive(updatedClient))));
        return JSON.stringify(updatedClient);
    }

    async UpdateClientAttributes(ctx, ubi, changes) {
        try {
            // 1. Vérifier l'existence du client
            const exists = await this.ClientExists(ctx, ubi);
            if (!exists) {
                throw new Error(`Le client avec l'UBI ${ubi} n'existe pas`);
            }

            // 2. Récupérer l'état actuel du client
            const clientState = await ctx.stub.getState(ubi);
            const client = JSON.parse(clientState.toString());

            // 3. Parser les modifications
            const updates = JSON.parse(changes);

            // 4. Liste des champs modifiables
            const modifiableFields = [
                'firstName',
                'lastName',
                'dateOfBirth',
                'gender',
                'email',
                'imageDocumentIdentification',
                'isActive'
            ];

            // 5. Valider et appliquer les modifications
            for (const [key, value] of Object.entries(updates)) {
                // Vérifier si le champ est modifiable
                if (!modifiableFields.includes(key)) {
                    throw new Error(`Le champ ${key} ne peut pas être modifié directement.`);
                }

                // Valider que la valeur n'est pas null/undefined
                if (value === null || value === undefined) {
                    throw new Error(`La valeur pour le champ ${key} ne peut pas être nulle`);
                }

                // Appliquer la modification
                client[key] = value;
            }

            // 6. Ajouter l'entrée d'historique
            const mspId = ctx.clientIdentity.getMSPID();
            const timestamp = this.getTransactionTimestamp(ctx);

            client.modificationHistory.push({
                mspId: mspId,
                timestamp: timestamp,
                action: 'UPDATE_ATTRIBUTES',
                modifiedFields: Object.keys(updates)
            });

            // 7. Sauvegarder les modifications
            await ctx.stub.putState(ubi, Buffer.from(stringify(sortKeysRecursive(client))));

            return JSON.stringify(client);
        } catch (error) {
            console.error('Erreur dans UpdateClientAttributes:', error);
            throw error;
        }
    }
    
    async DeactivateClient(ctx, ubi) {
        // Vérifier l'existence du client
        const exists = await this.ClientExists(ctx, ubi);
        if (!exists) {
            throw new Error(`Le client avec l'UBI ${ubi} n'existe pas`);
        }
    
        // Récupérer l'état du client directement
        const clientState = await ctx.stub.getState(ubi);
        const client = JSON.parse(clientState.toString());
    
        // Vérifier si le client est déjà désactivé
        if (!client.isActive) {
            throw new Error(`Le client avec l'UBI ${ubi} est déjà désactivé`);
        }
    
        // Mettre à jour le statut et l'historique
        const mspId = ctx.clientIdentity.getMSPID();
        const timestamp = this.getTransactionTimestamp(ctx);
        
        client.isActive = false;
        client.modificationHistory = [
            ...(client.modificationHistory || []),
            {
                mspId: mspId,
                timestamp: timestamp,
                action: 'DEACTIVATE'
            }
        ];
    
        // Sauvegarder les modifications
        await ctx.stub.putState(ubi, Buffer.from(JSON.stringify(sortKeysRecursive(client))));
        return JSON.stringify(client);
    }
    
    async ActivateClient(ctx, ubi) {
        // Vérifier l'existence du client
        const exists = await this.ClientExists(ctx, ubi);
        if (!exists) {
            throw new Error(`Le client avec l'UBI ${ubi} n'existe pas`);
        }
    
        // Récupérer l'état du client directement
        const clientState = await ctx.stub.getState(ubi);
        const client = JSON.parse(clientState.toString());
    
        // Vérifier si le client est déjà activé
        if (client.isActive) {
            throw new Error(`Le client avec l'UBI ${ubi} est déjà activé`);
        }
    
        // Mettre à jour le statut et l'historique
        const mspId = ctx.clientIdentity.getMSPID();
        const timestamp = this.getTransactionTimestamp(ctx);
        
        client.isActive = true;
        client.modificationHistory = [
            ...(client.modificationHistory || []),
            {
                mspId: mspId,
                timestamp: timestamp,
                action: 'ACTIVATE'
            }
        ];
    
        // Sauvegarder les modifications
        await ctx.stub.putState(ubi, Buffer.from(JSON.stringify(sortKeysRecursive(client))));
        return JSON.stringify(client);
    }
    
    async AddAccount(ctx, ubi, accountNumber, bankName) {
        // Vérifier l'existence du client
        const exists = await this.ClientExists(ctx, ubi);
        if (!exists) {
            throw new Error(`Le client avec l'UBI ${ubi} n'existe pas`);
        }
    
        // Récupérer l'état du client directement
        const clientState = await ctx.stub.getState(ubi);
        const client = JSON.parse(clientState.toString());
    
        // Vérifier que le client est actif
        if (!client.isActive) {
            throw new Error(`Le client avec l'UBI ${ubi} est désactivé et ne peut pas recevoir de nouveau compte`);
        }
    
        // Vérifier si le compte existe déjà
        const accountExists = client.accountList.some(
            account => account.accountNumber === accountNumber && account.bankName === bankName
        );
        if (accountExists) {
            throw new Error(`Le compte ${accountNumber} de la banque ${bankName} existe déjà pour ce client`);
        }
    
        // Valider les paramètres du compte
        if (!accountNumber || typeof accountNumber !== 'string' || accountNumber.trim() === '') {
            throw new Error('Le numéro de compte est invalide');
        }
        if (!bankName || typeof bankName !== 'string' || bankName.trim() === '') {
            throw new Error('Le nom de la banque est invalide');
        }
    
        // Ajouter le compte et mettre à jour l'historique
        const mspId = ctx.clientIdentity.getMSPID();
        const timestamp = this.getTransactionTimestamp(ctx);
        
        client.accountList.push({
            accountNumber: accountNumber.trim(),
            bankName: bankName.trim()
        });
    
        client.modificationHistory = [
            ...(client.modificationHistory || []),
            {
                mspId: mspId,
                timestamp: timestamp,
                action: 'ADD_ACCOUNT',
                details: { 
                    accountNumber: accountNumber.trim(), 
                    bankName: bankName.trim() 
                }
            }
        ];
    
        // Sauvegarder les modifications
        await ctx.stub.putState(ubi, Buffer.from(JSON.stringify(sortKeysRecursive(client))));
        return JSON.stringify(client);
    }
    
    // RemoveAccount
    async RemoveAccount(ctx, ubi, accountNumber) {
        try {
            // Vérifier l'existence du client
            const exists = await this.ClientExists(ctx, ubi);
            if (!exists) {
                throw new Error(`Le client avec l'UBI ${ubi} n'existe pas`);
            }
    
            // Récupérer l'état du client directement
            const clientState = await ctx.stub.getState(ubi);
            const client = JSON.parse(clientState.toString());
    
            // Vérifier que le client est actif
            if (!client.isActive) {
                throw new Error(`Le client avec l'UBI ${ubi} est désactivé et ne peut pas être modifié`);
            }
    
            // Valider le numéro de compte
            if (!accountNumber || typeof accountNumber !== 'string' || accountNumber.trim() === '') {
                throw new Error('Le numéro de compte est invalide');
            }
    
            // Vérifier si le compte existe
            const accountToRemove = client.accountList.find(account => account.accountNumber === accountNumber);
            if (!accountToRemove) {
                throw new Error(`Le compte ${accountNumber} n'existe pas pour ce client`);
            }
    
            // Supprimer le compte
            client.accountList = client.accountList.filter(account => account.accountNumber !== accountNumber);
    
            // Mettre à jour l'historique
            const mspId = ctx.clientIdentity.getMSPID();
            const timestamp = this.getTransactionTimestamp(ctx);
    
            client.modificationHistory.push({
                mspId: mspId,
                timestamp: timestamp,
                action: 'REMOVE_ACCOUNT',
                details: {
                    accountNumber: accountNumber,
                    bankName: accountToRemove.bankName // Inclure le nom de la banque dans l'historique
                }
            });
    
            // Sauvegarder les modifications
            await ctx.stub.putState(ubi, Buffer.from(stringify(sortKeysRecursive(client))));
            return JSON.stringify(client);
    
        } catch (error) {
            console.error('Erreur dans RemoveAccount:', error);
            throw error;
        }
    }
    
    // Ajouter une nationalité
    async AddNationality(ctx, ubi, countryName, idType, idNumber, imageDocumentIdentification) {
        try {
            // Vérifier l'existence du client
            const exists = await this.ClientExists(ctx, ubi);
            if (!exists) {
                throw new Error(`Le client avec l'UBI ${ubi} n'existe pas`);
            }

            // Récupérer l'état du client
            const clientState = await ctx.stub.getState(ubi);
            const client = JSON.parse(clientState.toString());

            // Vérifier que le client est actif
            if (!client.isActive) {
                throw new Error(`Le client avec l'UBI ${ubi} est désactivé et ne peut pas recevoir de nouvelle nationalité`);
            }

            // Valider les paramètres
            if (!countryName || typeof countryName !== 'string' || countryName.trim() === '') {
                throw new Error('Le nom du pays est invalide');
            }
            if (!idType || typeof idType !== 'string' || idType.trim() === '') {
                throw new Error('Le type de pièce d\'identité est invalide');
            }
            if (!idNumber || typeof idNumber !== 'string' || idNumber.trim() === '') {
                throw new Error('Le numéro de pièce d\'identité est invalide');
            }

            // Vérifier si la nationalité existe déjà
            const nationalityExists = client.nationalities && client.nationalities.some(
                nat => nat.countryName === countryName
            );
            if (nationalityExists) {
                throw new Error(`La nationalité ${countryName} existe déjà pour ce client`);
            }

            // S'assurer que le tableau des nationalités existe
            if (!client.nationalities) {
                client.nationalities = [];
            }

            // Ajouter la nouvelle nationalité
            const newNationality = {
                countryName: countryName.trim(),
                idDocument: {
                    type: idType.trim(),
                    number: idNumber.trim(),
                    imageDocumentIdentification: imageDocumentIdentification
                }
            };

            client.nationalities.push(newNationality);

            // Mettre à jour l'historique
            const mspId = ctx.clientIdentity.getMSPID();
            const timestamp = this.getTransactionTimestamp(ctx);

            client.modificationHistory = [
                ...(client.modificationHistory || []),
                {
                    mspId: mspId,
                    timestamp: timestamp,
                    action: 'ADD_NATIONALITY',
                    details: {
                        countryName: countryName.trim(),
                        idType: idType.trim(),
                        idNumber: idNumber.trim(),
                        imageDocumentIdentification: imageDocumentIdentification
                    }
                }
            ];

            // Sauvegarder les modifications
            await ctx.stub.putState(ubi, Buffer.from(stringify(sortKeysRecursive(client))));
            return JSON.stringify(client);

        } catch (error) {
            console.error('Erreur dans AddNationality:', error);
            throw error;
        }
    }

    // Supprimer une nationalité
    async RemoveNationality(ctx, ubi, countryName) {
        try {
            // Vérifier l'existence du client
            const exists = await this.ClientExists(ctx, ubi);
            if (!exists) {
                throw new Error(`Le client avec l'UBI ${ubi} n'existe pas`);
            }

            // Récupérer l'état du client
            const clientState = await ctx.stub.getState(ubi);
            const client = JSON.parse(clientState.toString());

            // Vérifier que le client est actif
            if (!client.isActive) {
                throw new Error(`Le client avec l'UBI ${ubi} est désactivé et ne peut pas être modifié`);
            }

            // Valider le pays
            if (!countryName || typeof countryName !== 'string' || countryName.trim() === '') {
                throw new Error('Le nom du pays est invalide');
            }

            // Vérifier si la nationalité existe
            const nationalityToRemove = client.nationalities && client.nationalities.find(
                nat => nat.countryName === countryName
            );
            if (!nationalityToRemove) {
                throw new Error(`La nationalité ${countryName} n'existe pas pour ce client`);
            }

            // Vérifier qu'il restera au moins une nationalité
            if (client.nationalities.length <= 1) {
                throw new Error('Impossible de supprimer la dernière nationalité du client');
            }

            // Supprimer la nationalité
            client.nationalities = client.nationalities.filter(nat => nat.countryName !== countryName);

            // Mettre à jour l'historique
            const mspId = ctx.clientIdentity.getMSPID();
            const timestamp = this.getTransactionTimestamp(ctx);

            client.modificationHistory.push({
                mspId: mspId,
                timestamp: timestamp,
                action: 'REMOVE_NATIONALITY',
                details: {
                    countryName: countryName,
                    removedDocument: nationalityToRemove.idDocument,
                    imageDocumentIdentification: imageDocumentIdentification
                }
            });

            // Sauvegarder les modifications
            await ctx.stub.putState(ubi, Buffer.from(stringify(sortKeysRecursive(client))));
            return JSON.stringify(client);

        } catch (error) {
            console.error('Erreur dans RemoveNationality:', error);
            throw error;
        }
    }
    // GetClientHistory modifié pour inclure les informations de modification
    async GetClientHistory(ctx, ubi) {
        try {
            const exists = await this.ClientExists(ctx, ubi);
            if (!exists) {
                throw new Error(`Le client avec l'UBI ${ubi} n'existe pas`);
            }

            const iterator = await ctx.stub.getHistoryForKey(ubi);
            const results = [];

            while (true) {
                const response = await iterator.next();
                if (response.done) {
                    break;
                }

                // Gestion sécurisée du timestamp
                let timestamp = null;
                if (response.value.timestamp) {
                    const epochSeconds = response.value.timestamp.seconds ?
                        parseInt(response.value.timestamp.seconds.toString()) : 0;
                    const nanos = response.value.timestamp.nanos ?
                        parseInt(response.value.timestamp.nanos.toString()) : 0;
                    timestamp = new Date(epochSeconds * 1000 + nanos / 1000000).toISOString();
                }

                let valueJson = response.value.value.toString('utf8');
                let clientData;
                try {
                    clientData = JSON.parse(valueJson);

                    // Construire l'entrée d'historique
                    const historyEntry = {
                        txId: response.value.tx_id,
                        timestamp: timestamp || new Date().toISOString(),
                        isDelete: Boolean(response.value.is_delete),
                        value: clientData,
                        // Ajouter les informations de création si disponibles
                        createdBy: clientData.createdBy || null,
                        // Trouver la modification correspondante dans l'historique
                        modificationDetails: clientData.modificationHistory ? 
                            clientData.modificationHistory[clientData.modificationHistory.length - 1] : null
                    };

                    results.push(historyEntry);
                } catch (err) {
                    console.error('Erreur lors du parsing JSON:', err);
                    results.push({
                        txId: response.value.tx_id,
                        timestamp: timestamp || new Date().toISOString(),
                        isDelete: Boolean(response.value.is_delete),
                        value: valueJson,
                        error: 'Erreur lors du parsing des données'
                    });
                }
            }

            await iterator.close();
            return JSON.stringify(results);
        } catch (error) {
            console.error('Erreur dans GetClientHistory:', error);
            throw error;
        }
    }

    // GetClientHistoryByDateRange modifié
    async GetClientHistoryByDateRange(ctx, ubi, startDate, endDate) {
        try {
            const exists = await this.ClientExists(ctx, ubi);
            if (!exists) {
                throw new Error(`Le client avec l'UBI ${ubi} n'existe pas`);
            }

            const start = new Date(startDate);
            const end = new Date(endDate);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                throw new Error('Dates invalides');
            }

            // Lire l'état actuel du client pour accéder à l'historique des modifications
            const clientString = await this.ReadClient(ctx, ubi);
            const client = JSON.parse(clientString);
            const modificationHistory = client.modificationHistory || [];

            // Filtrer l'historique des modifications par date
            const filteredHistory = modificationHistory.filter(mod => {
                const modDate = new Date(mod.timestamp);
                return modDate >= start && modDate <= end;
            });

            return JSON.stringify({
                UBI: ubi,
                dateRange: {
                    start: startDate,
                    end: endDate
                },
                modifications: filteredHistory
            });
        } catch (error) {
            console.error('Erreur dans GetClientHistoryByDateRange:', error);
            throw error;
        }
    }

    // GetClientAttributeHistory modifié
    async GetClientAttributeHistory(ctx, ubi, attributeName) {
        try {
            const exists = await this.ClientExists(ctx, ubi);
            if (!exists) {
                throw new Error(`Le client avec l'UBI ${ubi} n'existe pas`);
            }

            const iterator = await ctx.stub.getHistoryForKey(ubi);
            const results = [];

            while (true) {
                const response = await iterator.next();
                if (response.done) {
                    break;
                }

                let timestamp = null;
                if (response.value.timestamp) {
                    const epochSeconds = response.value.timestamp.seconds ?
                        parseInt(response.value.timestamp.seconds.toString()) : 0;
                    const nanos = response.value.timestamp.nanos ?
                        parseInt(response.value.timestamp.nanos.toString()) : 0;
                    timestamp = new Date(epochSeconds * 1000 + nanos / 1000000).toISOString();
                }

                if (response.value.value) {
                    const valueJson = response.value.value.toString('utf8');
                    try {
                        const clientData = JSON.parse(valueJson);
                        if (attributeName in clientData) {
                            const historyEntry = {
                                txId: response.value.tx_id,
                                timestamp: timestamp || new Date().toISOString(),
                                attributeName: attributeName,
                                value: clientData[attributeName],
                                // Ajouter les informations de modification si disponibles
                                modificationDetails: clientData.modificationHistory ? 
                                    clientData.modificationHistory.find(mod => 
                                        mod.modifiedFields && mod.modifiedFields.includes(attributeName)
                                    ) : null
                            };
                            results.push(historyEntry);
                        }
                    } catch (err) {
                        console.log('Erreur de parsing JSON pour l\'attribut');
                    }
                }
            }

            await iterator.close();
            return JSON.stringify(results);
        } catch (error) {
            console.error('Erreur dans GetClientAttributeHistory:', error);
            throw error;
        }
    }

    // GetClientHistorySummary modifié
    async GetClientHistorySummary(ctx, ubi) {
        try {
            const exists = await this.ClientExists(ctx, ubi);
            if (!exists) {
                throw new Error(`Le client avec l'UBI ${ubi} n'existe pas`);
            }

            // Lire l'état actuel du client
            const clientString = await this.ReadClient(ctx, ubi);
            const client = JSON.parse(clientString);

            const summary = {
                totalModifications: 0,
                modificationsByType: {},
                modificationsByOrg: {},
                createdBy: client.createdBy || null,
                lastModification: null,
                creationDate: null
            };

            if (client.modificationHistory && Array.isArray(client.modificationHistory)) {
                summary.totalModifications = client.modificationHistory.length;
                summary.creationDate = client.createdBy ? client.createdBy.timestamp : null;
                summary.lastModification = client.modificationHistory[client.modificationHistory.length - 1];

                // Compter les modifications par type d'action
                client.modificationHistory.forEach(mod => {
                    // Compter par type d'action
                    if (!summary.modificationsByType[mod.action]) {
                        summary.modificationsByType[mod.action] = 0;
                    }
                    summary.modificationsByType[mod.action]++;

                    // Compter par organisation
                    if (!summary.modificationsByOrg[mod.mspId]) {
                        summary.modificationsByOrg[mod.mspId] = 0;
                    }
                    summary.modificationsByOrg[mod.mspId]++;
                });
            }

            return JSON.stringify(summary);
        } catch (error) {
            console.error('Erreur dans GetClientHistorySummary:', error);
            throw error;
        }
    }
}

module.exports = ClientManager;
/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

'use strict';

const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class ClientManager extends Contract {

    async InitLedger(ctx) {
        const clients = [
            {
                UBI: 'CLI001',
                firstName: 'Thomas',
                lastName: 'Martin',
                dateOfBirth: '1985-03-15',
                gender: 'M',
                email: 'thomas.martin@email.com',
                accountList: [
                    { accountNumber: 'ACC001', bankName: 'BankA' }
                ],
                nationality: 'French',
                imageDocumentIdentification: 'base64_encoded_image_1',
                isActive: true,
                docType: 'client'
            },
            {
                UBI: 'CLI002',
                firstName: 'Marie',
                lastName: 'Dubois',
                dateOfBirth: '1990-07-22',
                gender: 'F',
                email: 'marie.dubois@email.com',
                accountList: [
                    { accountNumber: 'ACC002', bankName: 'BankB' }
                ],
                nationality: 'French',
                imageDocumentIdentification: 'base64_encoded_image_2',
                isActive: true,
                docType: 'client'
            }
        ];

        for (const client of clients) {
            await ctx.stub.putState(client.UBI, Buffer.from(stringify(sortKeysRecursive(client))));
        }
    }

    async CreateClient(ctx, ubi, firstName, lastName, dateOfBirth, gender, email, accountList, nationalities, imageDocumentIdentification) {
        try {
            console.log('Début de CreateClient');
            
            const exists = await this.ClientExists(ctx, ubi);
            if (exists) {
                throw new Error(`Le client avec l'UBI ${ubi} existe déjà`);
            }

            // Parse les tableaux JSON
            const parsedAccountList = JSON.parse(accountList);
            const parsedNationalities = JSON.parse(nationalities);

            console.log('Données parsées:', {
                parsedAccountList,
                parsedNationalities
            });

            // Validation des données
            if (!Array.isArray(parsedNationalities)) {
                throw new Error('Les nationalités doivent être fournies sous forme de tableau');
            }

            if (!Array.isArray(parsedAccountList)) {
                throw new Error('La liste des comptes doit être fournie sous forme de tableau');
            }

            const client = {
                UBI: ubi,
                firstName: firstName,
                lastName: lastName,
                dateOfBirth: dateOfBirth,
                gender: gender,
                email: email,
                accountList: parsedAccountList,
                nationalities: parsedNationalities, // Changé de nationality à nationalities
                imageDocumentIdentification: imageDocumentIdentification,
                isActive: true,
                docType: 'client'
            };

            console.log('Client à sauvegarder:', client);

            await ctx.stub.putState(ubi, Buffer.from(stringify(sortKeysRecursive(client))));
            
            console.log('Client sauvegardé avec succès');
            
            return JSON.stringify(client);
        } catch (error) {
            console.error('Erreur dans CreateClient:', error);
            throw error;
        }
    }

    async ReadClient(ctx, ubi) {
        console.log('Lecture du client:', ubi);
        const clientJSON = await ctx.stub.getState(ubi);
        if (!clientJSON || clientJSON.length === 0) {
            throw new Error(`Le client avec l'UBI ${ubi} n'existe pas`);
        }
        return clientJSON.toString();
    }

    // UpdateClient met à jour un client existant dans le world state
    async UpdateClient(ctx, ubi, firstName, lastName, dateOfBirth, gender, email, accountList, nationality, imageDocumentIdentification) {
        const exists = await this.ClientExists(ctx, ubi);
        if (!exists) {
            throw new Error(`Le client avec l'UBI ${ubi} n'existe pas`);
        }

        const updatedClient = {
            UBI: ubi,
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            gender: gender,
            email: email,
            accountList: JSON.parse(accountList),
            nationality: nationality,
            imageDocumentIdentification: imageDocumentIdentification,
            isActive: true,
            docType: 'client'
        };

        return ctx.stub.putState(ubi, Buffer.from(stringify(sortKeysRecursive(updatedClient))));
    }

    // DeactivateClient désactive un client au lieu de le supprimer
    async DeactivateClient(ctx, ubi) {
        const exists = await this.ClientExists(ctx, ubi);
        if (!exists) {
            throw new Error(`Le client avec l'UBI ${ubi} n'existe pas`);
        }

        const clientString = await this.ReadClient(ctx, ubi);
        const client = JSON.parse(clientString);
        client.isActive = false;

        return ctx.stub.putState(ubi, Buffer.from(stringify(sortKeysRecursive(client))));
    }

    // ClientExists vérifie si un client existe dans le world state
    async ClientExists(ctx, ubi) {
        const clientJSON = await ctx.stub.getState(ubi);
        return clientJSON && clientJSON.length > 0;
    }

    // AddAccount ajoute un nouveau compte à la liste des comptes d'un client
    async AddAccount(ctx, ubi, accountNumber, bankName) {
        const clientString = await this.ReadClient(ctx, ubi);
        const client = JSON.parse(clientString);
        
        client.accountList.push({
            accountNumber: accountNumber,
            bankName: bankName
        });

        return ctx.stub.putState(ubi, Buffer.from(stringify(sortKeysRecursive(client))));
    }

    // RemoveAccount supprime un compte de la liste des comptes d'un client
    async RemoveAccount(ctx, ubi, accountNumber) {
        const clientString = await this.ReadClient(ctx, ubi);
        const client = JSON.parse(clientString);
        
        client.accountList = client.accountList.filter(account => account.accountNumber !== accountNumber);

        return ctx.stub.putState(ubi, Buffer.from(stringify(sortKeysRecursive(client))));
    }

    // GetAllClients retourne tous les clients trouvés dans le world state
    async GetAllClients(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Ne retourner que les documents de type 'client'
                if (record.docType === 'client') {
                    allResults.push(record);
                }
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    // GetActiveClients retourne tous les clients actifs
    async GetActiveClients(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
                // Ne retourner que les clients actifs
                if (record.docType === 'client' && record.isActive === true) {
                    allResults.push(record);
                }
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    // UpdateClientAttributes permet de mettre à jour un ou plusieurs attributs d'un client
    async UpdateClientAttributes(ctx, ubi, changes) {
        const exists = await this.ClientExists(ctx, ubi);
        if (!exists) {
            throw new Error(`Le client avec l'UBI ${ubi} n'existe pas`);
        }

        // Récupérer le client existant
        const clientString = await this.ReadClient(ctx, ubi);
        const client = JSON.parse(clientString);

        // Parser les modifications demandées
        const updates = JSON.parse(changes);

        // Liste des champs modifiables
        const modifiableFields = [
            'firstName',
            'lastName',
            'dateOfBirth',
            'gender',
            'email',
            'nationality',
            'imageDocumentIdentification',
            'isActive'
        ];

        // Appliquer les modifications
        for (const [key, value] of Object.entries(updates)) {
            // Vérifier si le champ est modifiable
            if (!modifiableFields.includes(key)) {
                throw new Error(`Le champ ${key} ne peut pas être modifié directement. Utilisez les méthodes spécifiques pour modifier les comptes.`);
            }

            // Validation spécifique pour certains champs
            switch (key) {
                case 'email':
                    // Validation simple de l'email
                    if (!value.includes('@')) {
                        throw new Error('Format d\'email invalide');
                    }
                    break;
                case 'dateOfBirth':
                    // Vérifier si la date est valide
                    if (isNaN(Date.parse(value))) {
                        throw new Error('Format de date invalide');
                    }
                    break;
                case 'gender':
                    // Vérifier que le genre est soit 'M' soit 'F'
                    if (!['M', 'F'].includes(value)) {
                        throw new Error('Le genre doit être "M" ou "F"');
                    }
                    break;
                case 'isActive':
                    // Vérifier que isActive est un booléen
                    if (typeof value !== 'boolean') {
                        throw new Error('isActive doit être un booléen');
                    }
                    break;
            }

            // Appliquer la modification
            client[key] = value;
        }

        // Sauvegarder les modifications
        await ctx.stub.putState(ubi, Buffer.from(stringify(sortKeysRecursive(client))));

        // Retourner le client mis à jour
        return JSON.stringify(client);
    }

    // GetClientHistory retourne l'historique des modifications d'un client
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

                const modification = {
                    txId: response.value.tx_id,
                    timestamp: new Date().toISOString(), // Utilisation de la date actuelle pour le moment
                    isDelete: Boolean(response.value.is_delete)
                };

                if (response.value.value) {
                    const valueJson = response.value.value.toString('utf8');
                    try {
                        modification.value = JSON.parse(valueJson);
                    } catch {
                        modification.value = valueJson;
                    }
                }

                results.push(modification);
            }

            await iterator.close();
            return JSON.stringify(results);
        } catch (error) {
            console.error('Erreur dans GetClientHistory:', error);
            throw error;
        }
    }

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

            const iterator = await ctx.stub.getHistoryForKey(ubi);
            const results = [];

            while (true) {
                const response = await iterator.next();
                if (response.done) {
                    break;
                }

                const modification = {
                    txId: response.value.tx_id,
                    timestamp: new Date().toISOString(),
                    isDelete: Boolean(response.value.is_delete)
                };

                const modificationDate = new Date(modification.timestamp);
                
                // Filtrer par date
                if (modificationDate >= start && modificationDate <= end) {
                    if (response.value.value) {
                        const valueJson = response.value.value.toString('utf8');
                        try {
                            modification.value = JSON.parse(valueJson);
                        } catch {
                            modification.value = valueJson;
                        }
                    }
                    results.push(modification);
                }
            }

            await iterator.close();
            return JSON.stringify(results);
        } catch (error) {
            console.error('Erreur dans GetClientHistoryByDateRange:', error);
            throw error;
        }
    }

    // Obtenir l'historique des modifications d'un attribut spécifique
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

                if (response.value.value) {
                    const valueJson = response.value.value.toString('utf8');
                    try {
                        const clientData = JSON.parse(valueJson);
                        if (attributeName in clientData) {
                            results.push({
                                txId: response.value.tx_id,
                                timestamp: new Date().toISOString(),
                                attributeName: attributeName,
                                value: clientData[attributeName]
                            });
                        }
                    } catch {
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

    // Obtenir un résumé des modifications
    async GetClientHistorySummary(ctx, ubi) {
        try {
            const exists = await this.ClientExists(ctx, ubi);
            if (!exists) {
                throw new Error(`Le client avec l'UBI ${ubi} n'existe pas`);
            }

            const iterator = await ctx.stub.getHistoryForKey(ubi);
            const summary = {
                totalModifications: 0,
                modificationsByAttribute: {},
                lastModification: null,
                creationDate: null
            };

            while (true) {
                const response = await iterator.next();
                if (response.done) {
                    break;
                }

                summary.totalModifications++;

                if (response.value.value) {
                    const valueJson = response.value.value.toString('utf8');
                    try {
                        const clientData = JSON.parse(valueJson);
                        const timestamp = new Date().toISOString();

                        // Enregistrer la première modification comme date de création
                        if (!summary.creationDate) {
                            summary.creationDate = timestamp;
                        }

                        // Mettre à jour la dernière modification
                        summary.lastModification = timestamp;

                        // Compter les modifications par attribut
                        Object.keys(clientData).forEach(attr => {
                            if (!summary.modificationsByAttribute[attr]) {
                                summary.modificationsByAttribute[attr] = 0;
                            }
                            summary.modificationsByAttribute[attr]++;
                        });
                    } catch {
                        console.log('Erreur de parsing JSON pour le résumé');
                    }
                }
            }

            await iterator.close();
            return JSON.stringify(summary);
        } catch (error) {
            console.error('Erreur dans GetClientHistorySummary:', error);
            throw error;
        }
    }
}

module.exports = ClientManager;
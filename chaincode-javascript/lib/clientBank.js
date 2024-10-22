/*
 * SPDX-License-Identifier: Apache-2.0
 */

// Deterministic JSON.stringify()
const stringify = require('json-stringify-deterministic');
const sortKeysRecursive = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');
const Client = require('./client');  // Import de la classe Client

class ClientManagement extends Contract {

    async InitLedger(ctx) {
        const clients = [
            new Client(
                'UBI001',
                'Alice',
                'Johnson',
                '1990-01-01',
                'F',
                'alice.johnson@example.com',
                [
                    { accountNumber: 'ACC001', bankName: 'Bank A' },
                    { accountNumber: 'ACD001', bankName: 'Bank D' },
                ],
                [{ ISO2: 'BF', Pays: 'Burkina Faso', TypeDocument: 'Passport', DocumentNumber: 'A222155' }],
                'https://link-to-document.com/passport-alice.png',
                true
            ),
            new Client(
                'UBI002',
                'Bob',
                'Smith',
                '1985-02-15',
                'M',
                'bob.smith@example.com',
                [
                    { accountNumber: 'ACC002', bankName: 'Bank B' },
                ],
                [{ ISO2: 'US', Pays: 'United States', TypeDocument: 'Passport', DocumentNumber: 'B123456' }],
                'https://link-to-document.com/passport-bob.png',
                true
            ),
            new Client(
                'UBI003',
                'Joshua',
                'Nikiema',
                '2000-02-15',
                'M',
                'josh.nikiema@example.com',
                [
                    { accountNumber: 'ACC003', bankName: 'Bank B' },
                    { accountNumber: 'ACC004', bankName: 'Bank C' },
                ],
                [
                    { ISO2: 'BF', Pays: 'Burkina Faso', TypeDocument: 'ID Card', DocumentNumber: 'ID333456' },
                    { ISO2: 'FR', Pays: 'France', TypeDocument: 'Passport', DocumentNumber: 'FR789456' }
                ],
                'https://link-to-document.com/id-joshua.png',
                true
            ),
        ];
        

        for (const client of clients) {
            await ctx.stub.putState(client.UBI, Buffer.from(stringify(sortKeysRecursive(client))));
            console.info(`Client ${client.UBI} initialized`);
        }
    }

    // CreateClient issues a new client to the world state with given details.
    async CreateClient(ctx, ubi, firstName, lastName, dateOfBirth, gender, email, accountList, isActive, nationality, imageDocumentIdentification) {
        // Vérifier si le client existe déjà
        const exists = await this.ClientExists(ctx, ubi);
        if (exists) {
            throw new Error(`Le client ${ubi} existe déjà`);
        }
    
        // Valider accountList (comme expliqué précédemment)
        let parsedAccountList;
        try {
            parsedAccountList = JSON.parse(accountList);
        } catch (err) {
            throw new Error(`Le champ accountList doit être un tableau JSON valide: ${err.message}`);
        }
    
        // Valider nationality (tableau d'objets)
        let parsedNationality;
        try {
            parsedNationality = JSON.parse(nationality);
        } catch (err) {
            throw new Error(`Le champ nationality doit être un tableau JSON valide: ${err.message}`);
        }
    
        // Vérifier que nationality est bien un tableau
        if (!Array.isArray(parsedNationality)) {
            throw new Error(`Le champ nationality doit être un tableau d'objets`);
        }
    
        // Valider les propriétés de chaque objet dans nationality
        parsedNationality.forEach((nation, index) => {
            if (typeof nation.ISO2 !== 'string' || typeof nation.Pays !== 'string' ||
                typeof nation.TypeDocument !== 'string' || typeof nation.DocumentNumber !== 'string') {
                throw new Error(`L'entrée nationality à l'indice ${index} doit avoir les propriétés "ISO2", "Pays", "TypeDocument", et "DocumentNumber", toutes de type string.`);
            }
        });
    
        // Créer l'objet client avec les nouveaux attributs
        const client = new Client(
            ubi, 
            firstName, 
            lastName, 
            dateOfBirth, 
            gender, 
            email, 
            parsedAccountList, 
            isActive, 
            parsedNationality, 
            imageDocumentIdentification
        );
    
        // Enregistrer le client dans la blockchain
        await ctx.stub.putState(ubi, Buffer.from(stringify(sortKeysRecursive(client))));
    }
    
    

    // ReadClient returns the client stored in the world state with given UBI.
    async ReadClient(ctx, ubi) {
        const clientJSON = await ctx.stub.getState(ubi);
        if (!clientJSON || clientJSON.length === 0) {
            throw new Error(`Le client ${ubi} n'existe pas`);
        }
        return clientJSON.toString();
    }

    // UpdateClient updates an existing client in the world state with provided parameters.
    async UpdateClient(ctx, ubi, updatesJson) {
        // Vérifier si le client existe
        const exists = await this.ClientExists(ctx, ubi);
        if (!exists) {
            throw new Error(`Le client ${ubi} n'existe pas`);
        }
    
        // Récupérer le client existant dans la blockchain
        const clientJSON = await ctx.stub.getState(ubi);
        let client = JSON.parse(clientJSON.toString());
    
        // Parser les mises à jour fournies par l'utilisateur
        let updates;
        try {
            updates = JSON.parse(updatesJson);
        } catch (err) {
            throw new Error(`Le champ updates doit être un JSON valide: ${err.message}`);
        }
    
        // Mise à jour des champs spécifiques (exemple pour firstName, lastName, email, etc.)
        if (updates.firstName !== undefined) {
            client.firstName = updates.firstName;
        }
    
        if (updates.nationality !== undefined) {
            let parsedNationality;
            try {
                parsedNationality = JSON.parse(updates.nationality);
            } catch (err) {
                throw new Error(`Le champ nationality doit être un tableau JSON valide: ${err.message}`);
            }
    
            parsedNationality.forEach((nation, index) => {
                if (typeof nation.ISO2 !== 'string' || typeof nation.Pays !== 'string' ||
                    typeof nation.TypeDocument !== 'string' || typeof nation.DocumentNumber !== 'string') {
                    throw new Error(`L'entrée nationality à l'indice ${index} doit avoir les propriétés "ISO2", "Pays", "TypeDocument", et "DocumentNumber", toutes de type string.`);
                }
            });
    
            client.nationality = parsedNationality;
        }
    
        if (updates.imageDocumentIdentification !== undefined) {
            client.imageDocumentIdentification = updates.imageDocumentIdentification;
        }
    
        // Enregistrer les modifications dans la blockchain
        await ctx.stub.putState(ubi, Buffer.from(stringify(sortKeysRecursive(client))));
    }
    
    

    // DeleteClient deletes a given client from the world state.
    async DeleteClient(ctx, ubi) {
        const exists = await this.ClientExists(ctx, ubi);
        if (!exists) {
            throw new Error(`Le client ${ubi} n'existe pas`);
        }
        return ctx.stub.deleteState(ubi);
    }

    // ClientExists returns true when client with given UBI exists in world state.
    async ClientExists(ctx, ubi) {
        const clientJSON = await ctx.stub.getState(ubi);
        return clientJSON && clientJSON.length > 0;
    }

    // GetAllClients returns all clients found in the world state.
    async GetAllClients(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = ClientManagement;

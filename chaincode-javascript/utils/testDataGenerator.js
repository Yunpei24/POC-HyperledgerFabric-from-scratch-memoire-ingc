const seedrandom = require('seedrandom');

// Listes de données statiques (DOCUMENT_TYPES, COUNTRIES, BANKS, etc. restent identiques)
const DOCUMENT_TYPES = [
    { id: 'passport', name: 'Passeport', prefix: 'PASS' },
    { id: 'cni', name: 'Carte Nationale d\'Identité', prefix: 'CNI' },
    { id: 'cs', name: 'Carte de Séjour', prefix: 'CS' },
    { id: 'cr', name: 'Carte de Résident', prefix: 'CR' }
];

const COUNTRIES = [
    { name: 'Sénégal', code: 'SEN' },
    { name: 'Côte d\'Ivoire', code: 'CIV' },
    { name: 'Mali', code: 'MLI' },
    { name: 'Burkina Faso', code: 'BFA' },
    { name: 'Guinée', code: 'GIN' },
    { name: 'Bénin', code: 'BEN' },
    { name: 'Togo', code: 'TGO' },
    { name: 'Niger', code: 'NER' },
    { name: 'Cameroun', code: 'CMR' },
    { name: 'Gabon', code: 'GAB' }
];

const BANKS = [
    'Ecobank',
    'Corisbank International',
    'Bank Of Africa',
    'Société Générale',
    'Banque Atlantique',
    'UBA Bank',
    'BICIAB',
    'SGBF',
    'Orabank',
    'BSIC'
];

const FIRST_NAMES = [
    'Amadou', 'Fatou', 'Mamadou', 'Aminata', 'Omar', 'Aïcha', 'Ibrahim',
    'Mariama', 'Ousmane', 'Imane', 'Juste', 'Astrid', 'Elie', 'Kadiatou',
    'Seydou', 'Joshua', 'Fatoumata', 'Moussa', 'Adama', 'Djibril', 'Rama',
    'Modibo', 'Mariam', 'Boubacar', 'Oumou', 'Sékou', 'Aïssata', 'Abdoulaye',
    'Rokia', 'Issouf'
];

const LAST_NAMES = [
    'Diallo', 'Traoré', 'Sylla', 'Koné', 'Touré', 'Camara', 'Keita',
    'Bamba', 'Konaté', 'Cissé', 'Diabaté', 'Doumbia', 'Fofana',
    'Coulibaly', 'Sanogo', 'Dembélé', 'Kanté', 'Sawadogo', 'Nikiema',
    'Ouedraogo', 'Kamagaté', 'Ilboudo', 'Sidibé', 'Sakho', 'Barry',
    'Sanou', 'Ouattara', 'Dao', 'Kouyaté', 'Sissoko'
];

class DeterministicGenerator {
    constructor(seed = 'bceao2024') {
        this.rng = seedrandom(seed);
    }

    getRandomInt(min, max) {
        return Math.floor(this.rng() * (max - min + 1)) + min;
    }

    getRandomElement(array) {
        return array[this.getRandomInt(0, array.length - 1)];
    }

    getRandomDate(startYear = 1960, endYear = 2000) {
        const year = this.getRandomInt(startYear, endYear);
        const month = this.getRandomInt(1, 12);
        const day = this.getRandomInt(1, 28);
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }

    generateAccountNumber() {
        return `ACC${this.getRandomInt(100000, 999999)}`;
    }

    generateDocumentNumber(prefix) {
        return `${prefix}${this.getRandomInt(0, 999999).toString().padStart(6, '0')}`;
    }

    generateEmail(firstName, lastName) {
        const randomNum = this.getRandomInt(0, 999);
        return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@email.com`;
    }
}

function generateTestClientsData(imagesData, numberOfClients = 21, seed = 'bceao2024') {
    const generator = new DeterministicGenerator(seed);
    const clientsData = [];
    
    const ubiList = Array.from({ length: numberOfClients }, (_, i) => 
        `UEMOA-2024-${(i + 1).toString().padStart(6, '0')}`
    );

    for (let i = 0; i < numberOfClients; i++) {
        try {
            const clientIndex = i + 1;
            const ubi = ubiList[i];
            
            // Informations de base
            const firstName = generator.getRandomElement(FIRST_NAMES);
            const lastName = generator.getRandomElement(LAST_NAMES);
            const dateOfBirth = generator.getRandomDate();
            const gender = generator.rng() > 0.5 ? 'M' : 'F';
            const email = generator.generateEmail(firstName, lastName);

            // Comptes bancaires
            const numberOfAccounts = generator.getRandomInt(1, 3);
            const accountList = [];
            const usedBanks = new Set();

            for (let j = 0; j < numberOfAccounts; j++) {
                let bank;
                do {
                    bank = generator.getRandomElement(BANKS);
                } while (usedBanks.has(bank));

                usedBanks.add(bank);
                accountList.push({
                    accountNumber: generator.generateAccountNumber(),
                    bankName: bank
                });
            }

            // Nationalités
            const numberOfNationalities = generator.getRandomInt(1, 2);
            const selectedNationalities = [];
            const usedCountries = new Set();

            for (let j = 0; j < numberOfNationalities; j++) {
                let country;
                do {
                    country = generator.getRandomElement(COUNTRIES);
                } while (usedCountries.has(country.code));

                usedCountries.add(country.code);
                const docType = generator.getRandomElement(DOCUMENT_TYPES);

                selectedNationalities.push({
                    countryName: country.name,
                    idDocument: {
                        type: docType.id,
                        number: generator.generateDocumentNumber(docType.prefix),
                        imageDocumentIdentification: imagesData?.documents?.[clientIndex]?.[j + 1] || 
                            "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/Base64Default..."
                    }
                });
            }
            const demande_status = 'TRAITE';
            const demande_content = 'Création';

            const client = {
                ubi,
                firstName,
                lastName,
                dateOfBirth,
                gender,
                email,
                accountList,
                nationalities: selectedNationalities,
                imageFace: imagesData?.faces?.[clientIndex] || 
                    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/Base64Default...",
                demande_content,
                demande_status
            };

            clientsData.push(client);
        } catch (error) {
            console.error(`Erreur lors de la génération du client ${i + 1}:`, error);
            continue;
        }
    }

    if (clientsData.length === 0) {
        throw new Error('Aucun client n\'a pu être généré');
    }

    return clientsData;
}

module.exports = {
    generateTestClientsData
};
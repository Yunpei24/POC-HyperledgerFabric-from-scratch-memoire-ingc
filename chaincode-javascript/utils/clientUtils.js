// utils/ubiUtils.js

const UEMOA_COUNTRIES = {
    'BEN': 'Bénin',
    'BFA': 'Burkina Faso',
    'CIV': 'Côte d\'Ivoire',
    'GNB': 'Guinée-Bissau',
    'MLI': 'Mali',
    'NER': 'Niger',
    'SEN': 'Sénégal',
    'TGO': 'Togo'
};

class ClientUtils {
    // Fonction pour générer un UBI unique
    static async generateUniqueUBI(ctx) {
        try {
            // Structure: UEMOA-ANNEE-SEQUENCE
            const annee = new Date().getFullYear().toString();
            const ubiPrefix = `UEMOA-${annee}-`;
            
            let maxSequence = 0;
            const iterator = await ctx.stub.getStateByRange('', '');
            
            try {
                while (true) {
                    const result = await iterator.next();
                    if (result.done) break;

                    const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
                    const record = JSON.parse(strValue);
                    
                    if (record.docType === 'client' && record.UBI.startsWith(ubiPrefix)) {
                        const sequence = parseInt(record.UBI.split('-').pop());
                        if (!isNaN(sequence) && sequence > maxSequence) {
                            maxSequence = sequence;
                        }
                    }
                }
            } finally {
                await iterator.close();
            }

            const newSequence = (maxSequence + 1).toString().padStart(6, '0');
            return `${ubiPrefix}${newSequence}`;

        } catch (error) {
            console.error('Erreur dans generateUniqueUBI:', error);
            throw new Error(`Erreur lors de la génération de l'UBI: ${error.message}`);
        }
    }

    // Fonction pour vérifier les doublons
    static async checkForDuplicates(ctx, firstName, lastName, dateOfBirth, email) {
        const duplicates = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        
        try {
            while (true) {
                const result = await iterator.next();
                if (result.done) break;

                const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
                const record = JSON.parse(strValue);

                if (record.docType === 'client') {
                    let matchScore = 0;
                    let matchDetails = [];

                    // Email identique
                    if (email.toLowerCase() === record.email.toLowerCase()) {
                        matchScore += 100;
                        matchDetails.push('Email identique');
                    }

                    // Nom et prénom identiques
                    if (this.normalizeString(firstName) === this.normalizeString(record.firstName) &&
                        this.normalizeString(lastName) === this.normalizeString(record.lastName)) {
                        matchScore += 50;
                        matchDetails.push('Nom et prénom identiques');
                    }

                    // Date de naissance identique
                    if (dateOfBirth === record.dateOfBirth) {
                        matchScore += 30;
                        matchDetails.push('Date de naissance identique');
                    }

                    // Similarité des noms
                    const firstNameSimilarity = this.calculateStringSimilarity(
                        this.normalizeString(firstName),
                        this.normalizeString(record.firstName)
                    );
                    const lastNameSimilarity = this.calculateStringSimilarity(
                        this.normalizeString(lastName),
                        this.normalizeString(record.lastName)
                    );

                    if (firstNameSimilarity > 0.8 || lastNameSimilarity > 0.8) {
                        matchScore += 20;
                        matchDetails.push('Noms similaires');
                    }

                    if (matchScore >= 50) {
                        duplicates.push({
                            existingClient: {
                                UBI: record.UBI,
                                firstName: record.firstName,
                                lastName: record.lastName,
                                dateOfBirth: record.dateOfBirth,
                                email: record.email
                            },
                            matchScore,
                            matchDetails
                        });
                    }
                }
            }
        } finally {
            await iterator.close();
        }

        return duplicates;
    }

    // Fonctions utilitaires
    static normalizeString(str) {
        return str.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '');
    }

    static calculateStringSimilarity(str1, str2) {
        if (str1 === str2) return 1.0;
        if (str1.length === 0 || str2.length === 0) return 0.0;

        const matrix = Array(str2.length + 1).fill(null)
            .map(() => Array(str1.length + 1).fill(null));

        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + substitutionCost
                );
            }
        }

        const maxLength = Math.max(str1.length, str2.length);
        return 1 - (matrix[str2.length][str1.length] / maxLength);
    }

    static validateNationalities(nationalities) {
        if (!Array.isArray(nationalities)) {
            throw new Error('Les nationalités doivent être fournies sous forme de tableau');
        }

        nationalities.forEach(nationality => {
            if (!Object.keys(UEMOA_COUNTRIES).includes(nationality)) {
                throw new Error(`Nationalité invalide: ${nationality}. Doit être un pays de l'UEMOA.`);
            }
        });

        return true;
    }
}

module.exports = ClientUtils;
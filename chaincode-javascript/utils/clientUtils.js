// utils/ubiUtils.js
const axios = require('axios');
const Buffer = require('buffer').Buffer;
const FormData = require('form-data');

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
    static async checkForDuplicates(ctx, firstName, lastName, dateOfBirth, email, imageFace) {
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
                        matchScore += 40;
                        matchDetails.push('Email identique');
                    }

                    // Nom et prénom identiques
                    if (this.normalizeString(firstName) === this.normalizeString(record.firstName) &&
                        this.normalizeString(lastName) === this.normalizeString(record.lastName)) {
                        matchScore += 10;
                        matchDetails.push('Nom et prénom identiques');
                    }

                    // Date de naissance identique
                    if (dateOfBirth === record.dateOfBirth) {
                        matchScore += 5;
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
                        matchScore += 5;
                        matchDetails.push('Noms similaires');
                    }

                    let faceChecking = await this.CheckForDuplicatesByFace(
                        imageFace,
                        record.imageFace
                    );

                    if(faceChecking.isSimilar) {
                        matchScore += 40;
                        matchDetails.push('Photo très identique');
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

    // Fonction pour vérifier les doublons par reconnaissance faciale
    static async CheckForDuplicatesByFace(imageFace1, imageFace2) {
        try {
            console.log('Démarrage de la vérification faciale');
            
            const API_URL = process.env.FACE_API_URL || 'http://172.17.0.1:5021/api/face-recognition';
            console.log('API URL:', API_URL);

            const formData = new FormData();

            // Conversion des images base64 en Buffer
            if (typeof imageFace1 === 'string') {
                if (imageFace1.startsWith('data:image')) {
                    const buffer1 = await this.base64ToBuffer(imageFace1);
                    formData.append('image1', buffer1, {
                        filename: 'image1.jpg',
                        contentType: 'image/jpeg'
                    });
                } else if (imageFace1.startsWith('http')) {
                    const response1 = await axios.get(imageFace1, { responseType: 'arraybuffer' });
                    formData.append('image1', response1.data, {
                        filename: 'image1.jpg',
                        contentType: 'image/jpeg'
                    });
                }
            }

            if (typeof imageFace2 === 'string') {
                if (imageFace2.startsWith('data:image')) {
                    const buffer2 = await this.base64ToBuffer(imageFace2);
                    formData.append('image2', buffer2, {
                        filename: 'image2.jpg',
                        contentType: 'image/jpeg'
                    });
                } else if (imageFace2.startsWith('http')) {
                    const response2 = await axios.get(imageFace2, { responseType: 'arraybuffer' });
                    formData.append('image2', response2.data, {
                        filename: 'image2.jpg',
                        contentType: 'image/jpeg'
                    });
                }
            }

            const response = await axios.post(API_URL, formData, {
                timeout: 60000,
                maxRetries: 3,
                retryDelay: 1000,
                headers: {
                    ...formData.getHeaders(),
                },
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                }
            });

            console.log('Réponse API status:', response.status);
            
            if (response.status !== 200) {
                throw new Error(`API a retourné le status ${response.status}`);
            }

            return {
                isSimilar: response.data.is_similar,
                similarity: response.data.similarity
            };

        } catch (error) {
            console.error('Erreur détaillée dans CheckForDuplicatesByFace:', {
                message: error.message,
                code: error.code,
                response: error.response?.data,
                config: error.config
            });
            
            throw new Error(`Erreur lors de la vérification faciale: ${error.message}`);
        }
    }

    static base64ToBuffer(base64String) {
        // Extraire la partie base64 pure
        const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches.length !== 3) {
            throw new Error('Invalid base64 string');
        }

        const base64 = matches[2];
        return Buffer.from(base64, 'base64');
    }

    // Fonctions utilitaires
    static normalizeString(str) {
        return str.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '');
    }

    static calculateStringSimilarity(str1, str2) {
        try {
            // Cas de base : si les chaînes sont identiques
            if (str1 === str2) {
                return 1.0;
            }
    
            // Si l'une des chaînes est vide
            if (str1.length === 0 || str2.length === 0) {
                return 0.0;
            }
    
            // Convertir en minuscules pour la comparaison
            const s1 = str1.toLowerCase();
            const s2 = str2.toLowerCase();
    
            // Calcul de la plus longue sous-séquence commune (LCS)
            const lcs = this.getLongestCommonSubsequence(s1, s2);
            
            // Calcul des caractères communs dans l'ordre
            let commonInOrder = 0;
            let j = 0;
            for (let i = 0; i < s1.length && j < s2.length; i++) {
                if (s1[i] === s2[j]) {
                    commonInOrder++;
                    j++;
                }
            }
    
            // Calcul des caractères à la même position
            let samePosition = 0;
            for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
                if (s1[i] === s2[i]) {
                    samePosition++;
                }
            }
    
            // Facteurs de similarité ajustés
            const lcsScore = lcs.length / Math.max(s1.length, s2.length);
            const orderScore = commonInOrder / Math.max(s1.length, s2.length);
            const positionScore = samePosition / Math.max(s1.length, s2.length);
            
            // Premier caractère identique donne un bonus
            const firstCharBonus = s1[0] === s2[0] ? 0.1 : 0;
    
            // Calcul du score final avec pondération ajustée
            const similarityScore = (
                (lcsScore * 0.4) +         // 40% pour la sous-séquence commune
                (orderScore * 0.3) +        // 30% pour l'ordre des caractères
                (positionScore * 0.3) +     // 30% pour les positions identiques
                firstCharBonus              // Bonus pour première lettre identique
            );
    
            // Ajustement final pour pénaliser plus fortement les différences importantes
            const finalScore = Math.pow(similarityScore, 1.5);
            
            // Arrondir à 2 décimales
            const roundedScore = Math.round(finalScore * 100) / 100;
    
            // Logging des détails du calcul
            console.log({
                str1: s1,
                str2: s2,
                details: {
                    lcsLength: lcs.length,
                    commonInOrder,
                    samePosition,
                    lcsScore: Math.round(lcsScore * 100) / 100,
                    orderScore: Math.round(orderScore * 100) / 100,
                    positionScore: Math.round(positionScore * 100) / 100,
                    firstCharBonus,
                    similarityScore: Math.round(similarityScore * 100) / 100
                },
                finalScore: roundedScore
            });
    
            return roundedScore;
        } catch (error) {
            console.error('Erreur dans calculateStringSimilarity:', error);
            return 0.0;
        }
    }
    
    // Fonction auxiliaire pour calculer la plus longue sous-séquence commune
    static getLongestCommonSubsequence(s1, s2) {
        const m = s1.length;
        const n = s2.length;
        const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(''));
        
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (s1[i-1] === s2[j-1]) {
                    dp[i][j] = dp[i-1][j-1] + s1[i-1];
                } else {
                    dp[i][j] = dp[i][j-1].length > dp[i-1][j].length ? dp[i][j-1] : dp[i-1][j];
                }
            }
        }
        
        return dp[m][n];
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
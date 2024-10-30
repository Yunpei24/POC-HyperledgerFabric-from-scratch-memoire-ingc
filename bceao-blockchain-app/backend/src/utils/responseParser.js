function parseResponse(response) {
    try {
        // Si c'est un Buffer ou un Uint8Array
        if (Buffer.isBuffer(response) || response instanceof Uint8Array) {
            const stringData = Buffer.from(response).toString('utf8');
            console.log('Données converties en string:', stringData);
            return JSON.parse(stringData);
        }
        
        // Si c'est déjà une chaîne
        if (typeof response === 'string') {
            return JSON.parse(response);
        }

        throw new Error('Format de réponse non pris en charge');
    } catch (error) {
        console.error('Erreur parsing réponse:', error);
        console.log('Contenu brut:', response);
        throw error;
    }
}

module.exports = parseResponse;
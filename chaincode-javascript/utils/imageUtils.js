// utils/imageUtils.js

class ImageUtils {
    static validateImage(imageData) {
        try {
            // Vérifier si l'image est en base64
            if (!imageData.match(/^data:image\/(jpeg|png|jpg);base64,/)) {
                throw new Error('Format d\'image invalide. L\'image doit être en base64 (JPEG, PNG ou JPG)');
            }

            // Extraire les données base64 réelles
            const base64Data = imageData.split(',')[1];

            // Vérifier la taille de l'image (max 2MB)
            const sizeInBytes = Buffer.from(base64Data, 'base64').length;
            const maxSize = 2 * 1024 * 1024; // 2MB
            if (sizeInBytes > maxSize) {
                throw new Error('L\'image est trop grande. Taille maximale: 2MB');
            }

            return true;
        } catch (error) {
            throw new Error(`Erreur de validation d'image: ${error.message}`);
        }
    }

    static async processImage(imageData) {
        try {
            // Extraire le type MIME et les données
            const matches = imageData.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
            if (!matches) {
                throw new Error('Format d\'image invalide');
            }

            const imageType = matches[1];
            const base64Data = matches[2];

            // Créer un objet avec les métadonnées
            const imageObject = {
                type: imageType,
                data: base64Data,
                uploadedAt: new Date().toISOString(),
                size: Buffer.from(base64Data, 'base64').length
            };

            return imageObject;
        } catch (error) {
            throw new Error(`Erreur de traitement d'image: ${error.message}`);
        }
    }
}

module.exports = ImageUtils;
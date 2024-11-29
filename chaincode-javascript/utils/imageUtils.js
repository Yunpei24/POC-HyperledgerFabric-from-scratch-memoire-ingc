// imageUtils.js
const fs = require('fs').promises;
const path = require('path');
const mime = require('mime-types');

async function loadImages(faceImagesDir, docImagesDir, numberOfClients) {
    const imagesData = {
        faces: {},
        documents: {}
    };

    try {
        // Charger les images des visages
        for (let i = 1; i <= numberOfClients; i++) {
            try {
                const extensions = ['.jpg', '.jpeg', '.png'];
                let faceImagePath = null;
                let faceImageType = null;

                // Chercher la première extension valide
                for (const ext of extensions) {
                    const testPath = path.join(faceImagesDir, `faceID_${i}${ext}`);
                    try {
                        await fs.access(testPath);
                        faceImagePath = testPath;
                        faceImageType = mime.lookup(ext);
                        break;
                    } catch (err) {
                        continue;
                    }
                }

                if (faceImagePath) {
                    const imageBuffer = await fs.readFile(faceImagePath);
                    imagesData.faces[i] = `data:${faceImageType};base64,${imageBuffer.toString('base64')}`;
                }

                // Charger les images des documents (jusqu'à 2 par client)
                imagesData.documents[i] = {};
                for (let j = 1; j <= 2; j++) {
                    for (const ext of extensions) {
                        const testPath = path.join(docImagesDir, `docImage_${j}${ext}`);
                        try {
                            await fs.access(testPath);
                            const imageBuffer = await fs.readFile(testPath);
                            imagesData.documents[i][j] = `data:${mime.lookup(ext)};base64,${imageBuffer.toString('base64')}`;
                            break;
                        } catch (err) {
                            continue;
                        }
                    }
                }
            } catch (error) {
                console.warn(`Erreur lors du chargement des images pour le client ${i}:`, error);
            }
        }
        return imagesData;
    } catch (error) {
        console.error('Erreur lors du chargement des images:', error);
        throw error;
    }
}

module.exports = { loadImages };
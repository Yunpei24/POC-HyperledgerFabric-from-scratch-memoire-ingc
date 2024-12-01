// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const API_AI_URL = 'http://0.0.0.0:5021/api/face-recognition';

// Fonction pour comparer une image avec celle d'un client
export const compareImages = async (uploadedImage, clientImageUrl) => {
    try {
        // Convertir l'URL de l'image client en fichier
        const clientImageResponse = await fetch(clientImageUrl);
        const clientImageBlob = await clientImageResponse.blob();
        const clientImageFile = new File([clientImageBlob], 'clientImage.jpg', { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('image1', uploadedImage);
        formData.append('image2', clientImageFile);
        
        const response = await axios.post(API_AI_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la comparaison:', error);
        throw new Error('Erreur lors de la comparaison des images');
    }
};

// Fonction pour rechercher les clients similaires
export const searchClientsByFace = async (uploadedImage, clients) => {
    try {
        const similarClients = [];
        console.log("Début de la recherche faciale...");

        // Parcourir tous les clients et comparer leurs images
        for (const client of clients) {
            if (client.imageFace) {
                try {
                    const { similarity, is_similar } = await compareImages(uploadedImage, client.imageFace);
                    console.log(`Client ${client.UBI}:`, { similarity, is_similar });
                    
                    // N'ajouter le client que si is_similar est true
                    if (is_similar === true) {  // Comparaison stricte
                        similarClients.push({
                            ...client,
                            similarity: similarity
                        });
                        console.log(`Client ${client.UBI} ajouté avec similarité:`, similarity);
                    } else {
                        console.log(`Client ${client.UBI} non ajouté car non similaire`);
                    }
                } catch (error) {
                    console.error(`Erreur lors de la comparaison avec le client ${client.UBI}:`, error);
                    continue;
                }
            }
        }

        console.log("Clients similaires trouvés:", similarClients.length);
        
        // Trier les clients par score de similarité décroissant
        return similarClients.sort((a, b) => b.similarity - a.similarity);
    } catch (error) {
        console.error("Erreur globale lors de la recherche:", error);
        throw new Error('Erreur lors de la recherche des clients similaires');
    }
};


const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

// Fonctions d'authentification
export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Erreur de connexion');
    }
};

// Fonctions de gestion des clients
export const getAllClients = async () => {
    try {
        const response = await api.get('/clients/all');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des clients');
    }
};

export const getClient = async (ubi) => {
    try {
        const response = await api.get(`/clients/${ubi}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Erreur lors de la récupération du client');
    }
};

export const getActiveClients = async () => {
    try {
      const response = await api.get('/clients/active');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Erreur lors de la récupération des clients actifs');
    }
  };

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const createClient = async (clientData, maxRetries = 3) => {
    let attempt = 0;
    
    while (attempt < maxRetries) {
        try {
            const response = await api.post('/clients/create', clientData);
            
            // Si la réponse contient des similitudes
            if (response.data && response.data.similitude === true) {
                return {
                    similitude: true,
                    potentialClient: response.data.potentialClient,
                    similarClients: response.data.similarClients
                };
            }
            
            // Si pas de similitudes, retourner le client créé
            return response.data;
            
        } catch (error) {
            attempt++;
            
            // Si c'est une erreur de timeout ou de réseau et qu'il reste des tentatives
            if ((error.code === 'ECONNABORTED' || error.message.includes('timeout')) && attempt < maxRetries) {
                console.log(`Tentative ${attempt}/${maxRetries} échouée, nouvelle tentative dans 5 secondes...`);
                await wait(5000);
                continue;
            }
            
            // Si l'erreur contient des informations de similitude
            if (error.response?.data?.similitude) {
                return {
                    similitude: true,
                    potentialClient: error.response.data.potentialClient,
                    similarClients: error.response.data.similarClients
                };
            }
            
            // Si c'est la dernière tentative ou une autre erreur
            throw new Error(error.response?.data?.error || 'Erreur lors de la création du client');
        }
    }
};

export const updateClient = async (ubi, clientData) => {
    try {
        const response = await api.put(`/clients/${ubi}`, clientData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Erreur lors de la mise à jour du client');
    }
};

export const deactivateClient = async (ubi, demande_content) => {
    try {
        const response = await api.delete(`/clients/${ubi}`, {
            data: { demande_content }  // Envoi du motif dans le body
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Erreur lors de la désactivation du client');
    }
};

export const activateClient = async (ubi) => {
    try {
        const response = await api.put(`/clients/${ubi}/activate`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Erreur lors de l\'activation du client');
    }
};

export const getClientHistory = async (ubi) => {
    try {
        const response = await api.get(`/clients/${ubi}/history`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Erreur lors de la récupération de l\'historique');
    }
};

export const addAccountToClient = async (ubi, accountData) => {
    try {
        const response = await api.post(`/clients/${ubi}/accounts`, accountData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Erreur lors de l\'ajout du compte');
    }
};

export const removeAccount = async (ubi, accountNumber) => {
    try {
        const response = await api.delete(`/clients/${ubi}/accounts/${accountNumber}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addNationality = async (ubi, nationalityData) => {
    try {
        const response = await api.post(`/clients/${ubi}/nationalities`, nationalityData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || "Erreur lors de l'ajout de la nationalité");
    }
};

export const removeNationality = async (ubi, countryName) => {
    try {
        const response = await api.delete(`/clients/${ubi}/nationalities/${countryName}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Erreur lors de la suppression de la nationalité');
    }
};

// Fonctions utilitaires
export const logout = () => {
    localStorage.removeItem('user');
};

export const isAuthenticated = () => {
    const user = localStorage.getItem('user');
    return !!user;
};

export const getCurrentUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        return null;
    }
};
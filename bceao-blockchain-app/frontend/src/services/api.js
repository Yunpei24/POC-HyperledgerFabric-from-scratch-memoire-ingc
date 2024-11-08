// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

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

  export const createClient = async (clientData) => {
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
        // Si l'erreur contient des informations de similitude
        if (error.response?.data?.similitude) {
            return {
                similitude: true,
                potentialClient: error.response.data.potentialClient,
                similarClients: error.response.data.similarClients
            };
        }

        // Sinon, lancer une erreur standard
        throw new Error(error.response?.data?.error || 'Erreur lors de la création du client');
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

export const deactivateClient = async (ubi) => {
    try {
        const response = await api.delete(`/clients/${ubi}`);
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
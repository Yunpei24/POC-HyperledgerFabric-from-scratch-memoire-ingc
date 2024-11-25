// frontend/src/utils/searchUtils.js
import axios from 'axios';

export const API_URL = 'http://127.0.0.1:5001/api/face-recognition';

export const handleSearch = async (searchParams, setFilteredClients, clients, queryInfo, setQueryInfo) => {
    if (searchParams.imageFace) {
        try {
            const formData = new FormData();
            formData.append('image1', searchParams.imageFace);
            const response = await axios.post(API_URL, formData);
            setFilteredClients(response.data.similarClients);
        } catch (error) {
            console.error('Erreur lors de la reconnaissance faciale:', error);
            setFilteredClients(clients);
        }
    } else {
        let filtered = [...clients];

        // Filtrer par UBI
        if (searchParams.ubi) {
            filtered = filtered.filter(client =>
                client.UBI.toLowerCase().includes(searchParams.ubi.toLowerCase())
            );
        }

        // Filtrer par Nom
        if (searchParams.lastName) {
            filtered = filtered.filter(client =>
                client.lastName.toLowerCase().includes(searchParams.lastName.toLowerCase())
            );
        }

        // Filtrer par Prénom
        if (searchParams.firstName) {
            filtered = filtered.filter(client =>
                client.firstName.toLowerCase().includes(searchParams.firstName.toLowerCase())
            );
        }

        setFilteredClients(filtered);

        // Mettre à jour queryInfo avec les résultats filtrés
        if (queryInfo) {
            setQueryInfo(prev => ({
                ...prev,
                totalResults: filtered.length
            }));
        }
    }
};
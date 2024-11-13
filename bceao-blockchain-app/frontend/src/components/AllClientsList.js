// frontend/src/components/AllClientsList.js
import React, { useState, useEffect, useCallback } from 'react';
import { getAllClients, getClientHistory } from '../services/api';
import ClientListBase from './common/ClientListBase';
import ClientHistoryModal from './common/ClientHistoryModal';
import ClientSearchBar from './common/ClientSearchBar';

export default function AllClientsList() {
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [queryInfo, setQueryInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [selectedClientHistory, setSelectedClientHistory] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setLoading(true);
            const response = await getAllClients();

            if (Array.isArray(response)) {
                setClients(response);
                setFilteredClients(response);
                
                if (response.length > 0 && response[0].queryMetadata) {
                    setQueryInfo({
                        totalResults: response.length,
                        querier: response[0].queryMetadata.queriedBy.mspId,
                        timestamp: response[0].queryMetadata.queriedBy.timestamp
                    });
                }
            } else {
                console.error('Format de réponse inattendu:', response);
                setClients([]);
                setFilteredClients([]);
                setQueryInfo(null);
            }
        } catch (err) {
            console.error('Erreur lors du chargement des clients:', err);
            setError('Erreur lors du chargement des clients');
            setClients([]);
            setFilteredClients([]);
            setQueryInfo(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = useCallback(({ ubi, firstName, lastName }) => {
        let filtered = [...clients];

        // Filtrer par UBI
        if (ubi) {
            filtered = filtered.filter(client => 
                client.UBI.toLowerCase().includes(ubi.toLowerCase())
            );
        }

        // Filtrer par Nom
        if (lastName) {
            filtered = filtered.filter(client => 
                client.lastName.toLowerCase().includes(lastName.toLowerCase())
            );
        }

        // Filtrer par Prénom
        if (firstName) {
            filtered = filtered.filter(client => 
                client.firstName.toLowerCase().includes(firstName.toLowerCase())
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
    }, [clients, queryInfo]);

    const handleShowHistory = async (ubi) => {
        try {
            setHistoryLoading(true);
            const history = await getClientHistory(ubi);
            setSelectedClientHistory(history);
            setShowHistory(true);
        } catch (err) {
            console.error(err);
        } finally {
            setHistoryLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="space-y-6">
                {/* Barre de recherche */}
                <ClientSearchBar onSearch={handleSearch} />

                {/* Liste des clients */}
                <ClientListBase
                    title="Tous les Clients"
                    clients={filteredClients}
                    queryInfo={queryInfo}
                    loading={loading}
                    error={error}
                    onShowHistory={handleShowHistory}
                />

                {/* Modal d'historique */}
                {showHistory && (
                    <ClientHistoryModal
                        history={selectedClientHistory}
                        onClose={() => {
                            setShowHistory(false);
                            setSelectedClientHistory(null);
                        }}
                    />
                )}

                {/* Indicateur de chargement pour l'historique */}
                {historyLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
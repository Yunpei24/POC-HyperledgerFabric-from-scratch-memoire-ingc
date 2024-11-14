// frontend/src/components/ActiveClientList.js
import React, { useState, useEffect } from 'react';
import { getActiveClients, getClientHistory } from '../services/api';
import ClientListBase from './common/ClientListBase';
import ClientHistoryModal from './common/ClientHistoryModal';
import ClientSearchBar from './common/ClientSearchBar';

export default function ActiveClientList() {
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
      const response = await getActiveClients();

      if (response?.clients) {
        setClients(response.clients);
        setFilteredClients(response.clients);
        setQueryInfo(response.queryInfo);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = ({ type, params, result, error: searchError, searchType }) => {
    // Gestion des erreurs
    if (searchError) {
      setError(searchError);
      return;
    }

    // Réinitialiser l'erreur
    setError(null);

    if (type === 'FACE') {
      if (!result || result.length === 0) {
        // Si aucune correspondance faciale, afficher la liste vide avec le message
        setFilteredClients([]); // ICI: on met une liste vide au lieu de clients
        setQueryInfo(prev => ({
          ...prev,
          totalResults: 0, // ICI: on met 0 au lieu de clients.length
          searchType: 'Face Recognition',
          message: "Aucun client similaire trouvé"
        }));
      } else {
        setFilteredClients(result);
        setQueryInfo(prev => ({
          ...prev,
          totalResults: result.length,
          searchType: 'Face Recognition',
          message: null
        }));
      }
    } else if (type === 'TEXT') {
      let filtered = [...clients];
      const hasSearchCriteria = params.ubi || params.lastName || params.firstName;

      if (hasSearchCriteria) {
        if (params.ubi) {
          filtered = filtered.filter(client =>
            client.UBI.toLowerCase().includes(params.ubi.toLowerCase().trim())
          );
        }
        if (params.lastName) {
          filtered = filtered.filter(client =>
            client.lastName.toLowerCase().includes(params.lastName.toLowerCase().trim())
          );
        }
        if (params.firstName) {
          filtered = filtered.filter(client =>
            client.firstName.toLowerCase().includes(params.firstName.toLowerCase().trim())
          );
        }
      }

      setFilteredClients(filtered);
      setQueryInfo(prev => ({
        ...prev,
        totalResults: filtered.length,
        searchType: 'Text Search',
        message: hasSearchCriteria && filtered.length === 0 ? 
          "Aucun client ne correspond aux critères de recherche" : 
          null
      }));
    }
  };
  
  const handleShowHistory = async (ubi) => {
    try {
      setHistoryLoading(true);
      const history = await getClientHistory(ubi);
      setSelectedClientHistory(history);
      setShowHistory(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <ClientSearchBar 
          onSearch={handleSearch} 
          clients={clients} // Passer la liste des clients
        />
        <ClientListBase
          title="Clients Actifs"
          clients={filteredClients}
          queryInfo={queryInfo}
          loading={loading}
          error={error}
          onShowHistory={handleShowHistory}
          showSimilarity={queryInfo?.searchType === 'Face Recognition'}
          message={queryInfo?.message} // Ajout du message
        />

        {showHistory && (
          <ClientHistoryModal
            history={selectedClientHistory}
            onClose={() => {
              setShowHistory(false);
              setSelectedClientHistory(null);
            }}
          />
        )}

        {historyLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
          </div>
        )}
      </div>
    </div>
  );
}
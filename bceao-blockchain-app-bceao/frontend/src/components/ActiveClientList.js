// frontend/src/components/ActiveClientList.js
import React, { useState, useEffect, useCallback } from 'react';
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
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, showPendingOnly]);

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

  const filterClients = useCallback(() => {
    let filtered = [...clients];
    
    if (showPendingOnly) {
      filtered = filtered.filter(client => client.demande_status === 'A TRAITER');
    }

    setFilteredClients(filtered);
    setQueryInfo(prev => ({
      ...prev,
      totalResults: filtered.length,
      searchType: showPendingOnly ? 'Demandes en attente' : 'Clients Actifs'
    }));
  }, [clients, showPendingOnly, setFilteredClients, setQueryInfo]);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [filterClients]);

  const handleSearch = ({ type, params, result, error: searchError, searchType }) => {
    if (searchError) {
      setError(searchError);
      return;
    }

    setError(null);
    let searchResults = [];

    if (type === 'FACE') {
      if (!result || result.length === 0) {
        setFilteredClients([]);
        setQueryInfo(prev => ({
          ...prev,
          totalResults: 0,
          searchType: 'Face Recognition',
          message: "Aucun client similaire trouvé"
        }));
      } else {
        // Ne pas filtrer les résultats de reconnaissance faciale
        setFilteredClients(result);
        setQueryInfo(prev => ({
          ...prev,
          totalResults: result.length,
          searchType: 'Face Recognition'
        }));
      }
      return; // Important: sortir de la fonction ici
    } else if (type === 'TEXT') {
      searchResults = [...clients];
      const hasSearchCriteria = params.ubi || params.lastName || params.firstName;

      if (hasSearchCriteria) {
        if (params.ubi) {
          searchResults = searchResults.filter(client =>
            client.UBI.toLowerCase().includes(params.ubi.toLowerCase().trim())
          );
        }
        if (params.lastName) {
          searchResults = searchResults.filter(client =>
            client.lastName.toLowerCase().includes(params.lastName.toLowerCase().trim())
          );
        }
        if (params.firstName) {
          searchResults = searchResults.filter(client =>
            client.firstName.toLowerCase().includes(params.firstName.toLowerCase().trim())
          );
        }
      }

      // Appliquer le filtre des demandes en attente si activé
      if (showPendingOnly) {
        searchResults = searchResults.filter(client => client.demande_status === 'A TRAITER');
      }

      setFilteredClients(searchResults);
      setQueryInfo(prev => ({
        ...prev,
        totalResults: searchResults.length,
        searchType: 'Text Search',
        message: hasSearchCriteria && searchResults.length === 0 ? 
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
        {/* Toggle pour les demandes en attente */}
        <div className="flex items-center bg-white p-4 rounded-lg shadow">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showPendingOnly}
              onChange={(e) => setShowPendingOnly(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600 rounded"
            />
            <span className="ml-2 text-gray-700">
              Afficher uniquement les demandes en attente
            </span>
          </label>
        </div>

        <ClientSearchBar 
          onSearch={handleSearch} 
          clients={clients}
        />

        <ClientListBase
          title={showPendingOnly ? "Clients Actifs - Demandes en attente" : "Clients Actifs"}
          clients={filteredClients}
          queryInfo={queryInfo}
          loading={loading}
          error={error}
          onShowHistory={handleShowHistory}
          showSimilarity={queryInfo?.searchType === 'Face Recognition'}
          message={queryInfo?.message}
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
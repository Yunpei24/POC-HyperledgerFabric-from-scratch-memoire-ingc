import React, { useState, useEffect } from 'react';
import { getActiveClients, getClientHistory } from '../services/api';
import ClientListBase from './common/ClientListBase';
import ClientHistoryModal from './common/ClientHistoryModal';

export default function ActiveClientList() {
  const [clients, setClients] = useState([]);
  const [queryInfo, setQueryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour le modal d'historique
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
      
      if (response && response.clients) {
        setClients(response.clients);
        setQueryInfo(response.queryInfo);
      } else {
        setClients([]);
        console.error('Format de réponse inattendu:', response);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des clients:', err);
      setError('Erreur lors du chargement des clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

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
    <>
      <ClientListBase
        title="Clients Actifs"
        clients={clients}
        queryInfo={queryInfo}
        loading={loading}
        error={error}
        onShowHistory={handleShowHistory}
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
    </>
  );
}
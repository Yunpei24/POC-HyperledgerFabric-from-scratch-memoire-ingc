import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllClients, getActiveClients, getClientHistory } from '../services/api';

function ClientList({ activeOnly = true }) {
  // États
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [queryInfo, setQueryInfo] = useState(null); // Ajout de l'état queryInfo

  // États pour le modal d'historique
  const [showHistory, setShowHistory] = useState(false);
  const [selectedClientHistory, setSelectedClientHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    loadClients();
  }, [activeOnly]);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Appel explicite à la bonne fonction selon activeOnly
      const response = await (activeOnly === false ? getAllClients() : getActiveClients());
      
      console.log('Response:', response); // Pour le débogage
      
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
      setHistoryError(null);
      const history = await getClientHistory(ubi);
      setSelectedClientHistory(history);
      setShowHistory(true);
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Modal d'historique
  const HistoryModal = ({ history, onClose }) => {
    if (!history || !Array.isArray(history)) return null;

    const formatValue = (value) => {
      if (!value) return 'Aucune donnée';
      
      try {
        // Formater les nationalités
        if (Array.isArray(value.nationalities)) {
          value.nationalities = value.nationalities.join(', ');
        }
        
        // Masquer les données sensibles comme l'image
        if (value.imageDocumentIdentification) {
          value.imageDocumentIdentification = '[Document d\'identification]';
        }

        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><span className="font-semibold">UBI:</span> {value.UBI}</p>
              <p><span className="font-semibold">Nom:</span> {value.lastName}</p>
              <p><span className="font-semibold">Prénom:</span> {value.firstName}</p>
              <p><span className="font-semibold">Email:</span> {value.email}</p>
              <p><span className="font-semibold">Date de naissance:</span> {value.dateOfBirth}</p>
              <p><span className="font-semibold">Genre:</span> {value.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
            </div>
            <div>
              <p><span className="font-semibold">Statut:</span> {value.isActive ? 'Actif' : 'Inactif'}</p>
              <p><span className="font-semibold">Nationalités:</span> {value.nationalities}</p>
              <p><span className="font-semibold">Type:</span> {value.docType}</p>
              <div className="mt-2">
                <span className="font-semibold">Comptes bancaires:</span>
                {value.accountList && value.accountList.map((account, idx) => (
                  <p key={idx} className="ml-4">
                    {account.bankName} - {account.accountNumber}
                  </p>
                ))}
              </div>
            </div>
          </div>
        );
      } catch (error) {
        console.error('Erreur de formatage:', error);
        return 'Erreur de formatage des données';
      }
    };

    const getActionLabel = (action) => {
      const labels = {
        'CREATE': 'Création',
        'UPDATE': 'Mise à jour',
        'UPDATE_ATTRIBUTES': 'Modification d\'attributs',
        'READ': 'Lecture',
        'DEACTIVATE': 'Désactivation',
        'ACTIVATE': 'Activation',
        'ADD_ACCOUNT': 'Ajout de compte',
        'REMOVE_ACCOUNT': 'Suppression de compte'
      };
      return labels[action] || action;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
          <div className="px-6 py-4 bg-bceao-primary text-white flex justify-between items-center">
            <h3 className="text-xl font-semibold">Historique du Client</h3>
            <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl font-bold">×</button>
          </div>
          <div className="p-6 overflow-auto max-h-[calc(80vh-8rem)]">
            {history.map((entry, index) => (
              <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-4 pb-2 border-b">
                  <div className="text-sm">
                    <p className="font-semibold text-bceao-primary">
                      Date de modification:
                    </p>
                    <p>{new Date(entry.timestamp).toLocaleString()}</p>
                    
                    {/* Informations de création */}
                    {entry.createdBy && (
                      <p className="mt-2">
                        <span className="font-semibold text-bceao-primary">Créé par:</span>{' '}
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {entry.createdBy.mspId}
                        </span>
                      </p>
                    )}
                    
                    {/* Détails de la modification */}
                    {entry.modificationDetails && (
                      <>
                        <p className="mt-2">
                          <span className="font-semibold text-bceao-primary">Action:</span>{' '}
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            {getActionLabel(entry.modificationDetails.action)}
                          </span>
                        </p>
                        <p className="mt-2">
                          <span className="font-semibold text-bceao-primary">Organisation:</span>{' '}
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {entry.modificationDetails.mspId}
                          </span>
                        </p>
                        {entry.modificationDetails.modifiedFields && (
                          <p className="mt-2">
                            <span className="font-semibold text-bceao-primary">Champs modifiés:</span>{' '}
                            <span className="text-gray-600">
                              {entry.modificationDetails.modifiedFields.join(', ')}
                            </span>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  {formatValue(entry.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A94]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#004A94]">
            {activeOnly === false ? 'Tous les Clients' : 'Clients Actifs'}
          </h2>
          {queryInfo && (
            <div className="text-sm text-gray-600">
              <span>Total: {queryInfo.totalResults} client(s)</span>
              {queryInfo.querier && (
                <span className="ml-4">Organisation: {queryInfo.querier}</span>
              )}
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UBI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prénom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.UBI} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.UBI}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.lastName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.firstName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                      ${client.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'}`}>
                      {client.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link 
                      to={`/clients/${client.UBI}`}
                      className="text-[#004A94] hover:text-[#FFB612] mr-3"
                    >
                      Voir
                    </Link>
                    <Link 
                      to={`/clients/${client.UBI}/edit`}
                      className="text-green-600 hover:text-green-800 mr-3"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleShowHistory(client.UBI)}
                      className="text-[#004A94] hover:text-[#FFB612]"
                    >
                      Historique
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'historique */}
      {showHistory && (
        <HistoryModal
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
  );
}

export default ClientList;
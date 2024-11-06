import React from 'react';

const ClientHistoryModal = ({ history, onClose }) => {
  if (!history || !Array.isArray(history)) return null;

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

  const formatNationalities = (nationalities) => {
    if (!nationalities) return 'Non spécifié';
    if (Array.isArray(nationalities)) {
      return nationalities.join(', ');
    }
    return nationalities;
  };

  const formatAccounts = (accounts) => {
    if (!accounts || !Array.isArray(accounts)) return 'Aucun compte';
    return (
      <div className="ml-4">
        {accounts.map((account, idx) => (
          <p key={idx} className="text-sm">
            {account.bankName} - {account.accountNumber}
          </p>
        ))}
      </div>
    );
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
              {/* En-tête de l'entrée d'historique */}
              <div className="mb-4 p-4 bg-white rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-semibold text-bceao-primary">
                      Transaction du {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    {entry.modificationDetails && (
                      <div className="mt-2">
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-800">
                          {getActionLabel(entry.modificationDetails.action)}
                        </span>
                        <span className="ml-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                          {entry.modificationDetails.mspId}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contenu de l'entrée */}
              {entry.value && (
                <div className="bg-white p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Informations personnelles */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3 text-bceao-primary">Informations personnelles</h4>
                      <div className="space-y-2">
                        <p><span className="font-semibold">UBI:</span> {entry.value.UBI}</p>
                        <p><span className="font-semibold">Nom:</span> {entry.value.lastName}</p>
                        <p><span className="font-semibold">Prénom:</span> {entry.value.firstName}</p>
                        <p><span className="font-semibold">Email:</span> {entry.value.email}</p>
                        <p><span className="font-semibold">Date de naissance:</span> {entry.value.dateOfBirth}</p>
                        <p><span className="font-semibold">Genre:</span> {entry.value.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
                        <p><span className="font-semibold">Nationalités:</span> {formatNationalities(entry.value.nationalities)}</p>
                      </div>
                    </div>

                    {/* Informations comptes et statut */}
                    <div>
                      <h4 className="font-semibold text-lg mb-3 text-bceao-primary">Comptes et Statut</h4>
                      <div className="space-y-2">
                        <p>
                          <span className="font-semibold">Statut:</span>{' '}
                          <span className={`px-2 py-1 rounded ${entry.value.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {entry.value.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </p>
                        <div>
                          <span className="font-semibold">Comptes bancaires:</span>
                          {formatAccounts(entry.value.accountList)}
                        </div>
                        {entry.value.createdBy && (
                          <div className="mt-4">
                            <p className="font-semibold">Créé par:</p>
                            <p className="ml-2">Organisation: {entry.value.createdBy.mspId}</p>
                            <p className="ml-2">Date: {new Date(entry.value.createdBy.timestamp).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClientHistoryModal;
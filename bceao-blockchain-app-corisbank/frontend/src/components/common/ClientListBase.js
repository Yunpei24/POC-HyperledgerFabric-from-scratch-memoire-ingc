import React from 'react';
import { Link } from 'react-router-dom';
import { PhotoPreview } from './ImagePreview';

export default function ClientListBase({
  title,
  clients,
  queryInfo,
  loading,
  error,
  onShowHistory,
  showSimilarity = false,
  message // Ajout du prop message
}) {
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
          <h2 className="text-xl font-semibold text-[#004A94]">{title}</h2>
          {queryInfo && (
            <div className="text-sm text-gray-600">
              <span>Total: {queryInfo.totalResults} client(s)</span>
              {queryInfo.querier && (
                <span className="ml-4">Organisation: {queryInfo.querier}</span>
              )}
              {queryInfo.searchType && (
                <span className="ml-4">Type: {queryInfo.searchType}</span>
              )}
            </div>
          )}
        </div>

        {/* Affichage du message si présent */}
        {message && (
          <div className="p-4 text-center text-gray-600 bg-gray-50 border-b">
            {message}
          </div>
        )}

        {/* N'afficher le tableau que s'il y a des clients */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Photo
                </th>
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
                {showSimilarity && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Similarité
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.UBI} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PhotoPreview imageData={client.imageFace} />
                  </td>
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
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        client.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {client.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  {showSimilarity && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.similarity !== undefined && (
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${client.similarity * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">
                            {(client.similarity * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      to={`/clients/${client.UBI}`}
                      className="text-[#004A94] hover:text-[#FFB612] mr-3"
                    >
                      Voir
                    </Link>
                    <Link
                      to={`/clients/${client.UBI}/update`}
                      className="text-green-600 hover:text-green-800 mr-3"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => onShowHistory(client.UBI)}
                      className="text-[#004A94] hover:text-[#FFB612]"
                    >
                      Historique
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clients.length === 0 && !loading && !error && !message && (
            <div className="p-8 text-center text-gray-500">
              Aucun client trouvé
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
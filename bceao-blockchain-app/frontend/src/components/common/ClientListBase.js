//frontend/src/components/common/ClientListBase.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ClientHistoryModal from './ClientHistoryModal';  // On va aussi séparer le modal

export default function ClientListBase({ 
  title,
  clients,
  queryInfo,
  loading,
  error,
  onShowHistory 
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
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            {/* En-tête du tableau */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UBI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                      ${client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {client.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link to={`/clients/${client.UBI}`} className="text-[#004A94] hover:text-[#FFB612] mr-3">
                      Voir
                    </Link>
                    <Link to={`/clients/${client.UBI}/update`} className="text-green-600 hover:text-green-800 mr-3">
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
        </div>
      </div>
    </div>
  );
}
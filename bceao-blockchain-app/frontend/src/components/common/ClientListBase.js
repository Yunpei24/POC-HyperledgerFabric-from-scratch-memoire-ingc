// components/ClientListBase.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PhotoPreview } from './ImagePreview';
import DemandeModal from '../modals/DemandeModal';

export default function ClientListBase({
    title,
    clients,
    queryInfo,
    loading,
    error,
    onShowHistory,
    showSimilarity = false,
    message
}) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDemande, setSelectedDemande] = useState(null);

    const handleDemandeClick = (content) => {
        setSelectedDemande(content);
        setModalOpen(true);
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
        <div className="container mb-6 bg-white p-4 rounded-lg shadow w-full mx-auto">
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

                {message && (
                    <div className="p-4 text-center text-gray-600 bg-gray-50 border-b">
                        {message}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full table-fixed border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="w-[8%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Photo
                                </th>
                                <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    UBI
                                </th>
                                <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Nom
                                </th>
                                <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Prénom
                                </th>
                                <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Email
                                </th>
                                <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Statut Client
                                </th>
                                {showSimilarity && (
                                <th className="w-[10%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Similarité
                                </th>
                                )}
                                <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                                <th className="w-[12%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Statut Demande
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
                                            <div className="flex items-center">
                                                {/* Conteneur de la barre de progression */}
                                                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ 
                                                            width: `${Math.round(client.similarity * 100)}%`,
                                                            transition: 'width 0.5s ease-in-out'
                                                        }}
                                                    />
                                                </div>
                                                {/* Affichage du pourcentage */}
                                                <span className="text-sm font-medium text-gray-900">
                                                    {Math.round(client.similarity * 100)}%
                                                </span>
                                            </div>
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
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {client.demande_status && (
                                            <button
                                                onClick={() => handleDemandeClick(client.demande_content)}
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                                                    client.demande_status === 'TRAITE'
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                                                }`}
                                            >
                                                {client.demande_status}
                                            </button>
                                        )}
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

            <DemandeModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                content={selectedDemande}
            />
        </div>
    );
}
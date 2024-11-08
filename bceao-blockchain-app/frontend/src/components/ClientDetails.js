// frontend/src/components/ClientDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getClient, deactivateClient, activateClient } from '../services/api';
import BankAccountManagement from './BankAccountManagement';

// Composant pour l'affichage de l'image avec modal
const ImagePreview = ({ imageData }) => {
    const [showModal, setShowModal] = useState(false);

    if (!imageData) return null;

    return (
        <>
            {/* Miniature cliquable */}
            <div className="cursor-pointer" onClick={() => setShowModal(true)}>
                <img
                    src={imageData}
                    alt="Document d'identification"
                    className="h-40 object-cover rounded-lg border border-gray-200 hover:border-bceao-primary transition-colors"
                />
                <p className="text-sm text-gray-500 mt-1">Cliquez pour agrandir</p>
            </div>

            {/* Modal pour l'image en grand */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                     onClick={() => setShowModal(false)}>
                    <div className="relative max-w-4xl w-full bg-white rounded-lg p-2">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                        >
                            ×
                        </button>
                        <img
                            src={imageData}
                            alt="Document d'identification"
                            className="w-full h-auto rounded-lg"
                        />
                    </div>
                </div>
            )}
        </>
    );
};


function ClientDetails() {
    const { ubi } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClient = async () => {
            try {
                setLoading(true);
                const data = await getClient(ubi);
                setClient(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClient();
    }, [ubi]);

    // Nouvelle fonction pour formater les nationalités
    const formatNationalities = (client) => {
        if (Array.isArray(client.nationalities) && client.nationalities.length > 0) {
            return client.nationalities.join(', ');
        }
        // Si nationalities n'existe pas ou est vide, on regarde nationality
        if (client.nationalities) {
            // Si nationality est un tableau
            if (Array.isArray(client.nationalities)) {
                return client.nationalities.join(', ');
            }
            // Si nationality est une chaîne
            return client.nationalities;
        }
        return 'Non spécifié';
    };

    const handleAccountsChange = (newAccounts) => {
        setClient(prevClient => ({
            ...prevClient,
            accountList: newAccounts
        }));
    };

    const handleDeactivate = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir désactiver ce client ?')) {
            try {
                await deactivateClient(ubi);
                navigate('/');
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleActivate = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir activer ce client ?')) {
            try {
                await activateClient(ubi);
                const updatedClient = await getClient(ubi);
                setClient(updatedClient);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bceao-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4">
                {error}
            </div>
        );
    }

    if (!client) {
        return <div>Client non trouvé</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-bceao-primary text-white px-6 py-4">
                    <h2 className="text-2xl font-bold">Détails du Client</h2>
                </div>

                <div className="p-6">
                    {/* Première section : Information et Image */}
                    <div className="grid grid-cols-3 gap-6 mb-6">
                        {/* Colonne 1 et 2 : Informations */}
                        <div className="col-span-2">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-gray-600">UBI</h3>
                                    <p className="font-medium">{client.UBI}</p>
                                </div>
                                
                                <div>
                                    <h3 className="text-gray-600">Statut</h3>
                                    <p className={`inline-flex px-2 py-1 rounded-full text-sm font-semibold
                                        ${client.isActive 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'}`}>
                                        {client.isActive ? 'Actif' : 'Inactif'}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-gray-600">Nom</h3>
                                    <p className="font-medium">{client.lastName}</p>
                                </div>

                                <div>
                                    <h3 className="text-gray-600">Prénom</h3>
                                    <p className="font-medium">{client.firstName}</p>
                                </div>

                                <div>
                                    <h3 className="text-gray-600">Email</h3>
                                    <p className="font-medium">{client.email}</p>
                                </div>

                                <div>
                                    <h3 className="text-gray-600">Date de naissance</h3>
                                    <p className="font-medium">{client.dateOfBirth}</p>
                                </div>

                                <div>
                                    <h3 className="text-gray-600">Genre</h3>
                                    <p className="font-medium">
                                        {client.gender === 'M' ? 'Masculin' : 'Féminin'}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-gray-600">Nationalités</h3>
                                    <p className="font-medium">
                                        {formatNationalities(client)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Colonne 3 : Image du document */}
                        <div className="flex flex-col">
                            <h3 className="text-gray-600 mb-2">Document d'identification</h3>
                            {client.imageDocumentIdentification ? (
                                <ImagePreview imageData={client.imageDocumentIdentification} />
                            ) : (
                                <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <p className="text-gray-500">Aucun document</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section des comptes bancaires */}
                    <div className="p-6 border-t border-gray-200">
                        <BankAccountManagement
                            clientUBI={client.UBI}
                            accounts={client.accountList}
                            onAccountsChange={handleAccountsChange}
                        />
                    </div>

                    {/* Boutons d'action */}
                    <div className="mt-8 flex justify-end space-x-4">
                        <Link
                            to="/"
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Retour
                        </Link>
                        <Link
                            to={`/clients/${ubi}/edit`}
                            className="px-4 py-2 bg-bceao-secondary text-bceao-primary rounded-md hover:bg-yellow-500"
                        >
                            Modifier
                        </Link>
                        {client.isActive ? (
                            <button
                                onClick={handleDeactivate}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Demande Désactivation
                            </button>
                        ) : (
                            <button
                                onClick={handleActivate}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                                Demande Activation
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClientDetails;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getClient, rejetDemande, activateClient, deactivateClient } from '../services/api';
import BankAccountManagement from './BankAccountManagement';
import NationalityManagement from './NationalitiesManagement';
import { ImagePreview } from './common/ImagePreview';
import RejetModal from './modals/RejetModal';

function ClientDetails() {
    const { ubi } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // États pour les modals et loading
    const [isRejetModalOpen, setIsRejetModalOpen] = useState(false);
    const [rejetLoading, setRejetLoading] = useState(false);

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

    const handleNationalitiesChange = (newNationalities) => {
        setClient(prevClient => ({
            ...prevClient,
            nationalities: newNationalities
        }));
    };

    const handleAccountsChange = (newAccounts) => {
        setClient(prevClient => ({
            ...prevClient,
            accountList: newAccounts
        }));
    };

    // Handlers pour le rejet
    const handleRejetClick = () => {
        setIsRejetModalOpen(true);
    };

    const handleRejetConfirm = async (motif) => {
        if (!motif.trim()) {
            setError('Le motif est requis');
            return;
        }
    
        try {
            setRejetLoading(true);
            await rejetDemande(ubi, motif.trim());
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setRejetLoading(false);
            setIsRejetModalOpen(false);
        }
    };

    // Handlers pour l'activation/désactivation
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
                navigate('/');
            } catch (err) {
                setError(err.message);
            }
        }
    };

    // Rendus conditionnels pour chargement et erreurs
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
        <>
            <div className="w-full mx-auto px-4 py-8">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="bg-bceao-primary text-white px-6 py-4">
                        <h2 className="text-2xl font-bold">Détails du Client</h2>
                    </div>
     
                    <div className="p-6">
                        {/* Photo du client et informations de base */}
                        <div className="grid grid-cols-3 gap-6 mb-6">
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
     
                                    {client.demande_content && (
                                        <div>
                                            <h3 className="text-gray-600">Statut Demande</h3>
                                            <p className={`inline-flex px-2 py-1 rounded-full text-sm font-semibold
                                                ${client.demande_status === 'traité' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : client.demande_status === 'A TRAITER'
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : 'bg-red-100 text-red-800'}`}>
                                                {client.demande_status}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
     
                            {/* Photo du client */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Photo du Client</h3>
                                {client.imageFace ? (
                                    <ImagePreview imageData={client.imageFace} />
                                ) : (
                                    <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <p className="text-gray-500">Aucune Photo</p>
                                    </div>
                                )}
                            </div>
                        </div>
     
                        {/* Section des nationalités */}
                        <div className="border-t border-gray-200 pt-6">
                            <NationalityManagement
                                clientUBI={client.UBI}
                                nationalities={client.nationalities}
                                onNationalitiesChange={handleNationalitiesChange}
                            />
                        </div>
     
                        {/* Section des comptes bancaires */}
                        <div className="border-t border-gray-200 pt-6">
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
                                to={`/clients/${client.UBI}/update`}
                                className="px-4 py-2 bg-bceao-secondary text-bceao-primary rounded-md hover:bg-yellow-500"
                            >
                                Modifier
                            </Link>
     
                            {client.demande_status === 'A TRAITER' && (
                                <>
                                    <button
                                        onClick={handleRejetClick}
                                        className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                                        disabled={rejetLoading}
                                    >
                                        {rejetLoading ? 'Traitement...' : 'Rejeter'}
                                    </button>
                                    {client.isActive ? (
                                        <button
                                            onClick={handleDeactivate}
                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        >
                                            Désactivation
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleActivate}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            Activation
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
     
            <RejetModal
                isOpen={isRejetModalOpen}
                onClose={() => setIsRejetModalOpen(false)}
                onConfirm={handleRejetConfirm}
                loading={rejetLoading}
            />
        </>
     );
}

export default ClientDetails;
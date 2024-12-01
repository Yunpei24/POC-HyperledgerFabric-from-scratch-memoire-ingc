import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getClient, deactivateClient, activateClient } from '../services/api';
import BankAccountManagement from './BankAccountManagement';
import NationalityManagement from './NationalitiesManagement';
import { ImagePreview } from './common/ImagePreview';
import { useAuth } from '../context/AuthContext';
import DeactivationModal from './modals/DeactivationModal';

const AVAILABLE_BANKS = [
    { id: 'ecobank', name: 'Ecobank' },
    { id: 'corisbank', name: 'Corisbank' },
    { id: 'boa', name: 'Bank Of Africa' },
    { id: 'sgbf', name: 'Société Générale' },
    { id: 'bcb', name: 'Banque Commerciale du Burkina' },
    { id: 'ubabank', name: 'UBA Bank' },
    { id: 'biciab', name: 'BICIAB' },
];

function ClientDetails() {
    const { ubi } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const [isDeactivationModalOpen, setIsDeactivationModalOpen] = useState(false);
    const [deactivationLoading, setDeactivationLoading] = useState(false);

    // Extraire l'ID de la banque à partir du rôle utilisateur
    const getUserBankId = () => {
        if (!user || !user.username) return null;
        
        const bankPrefix = 'admin_';
        const username = user.username.toLowerCase();
        
        if (username.startsWith(bankPrefix)) {
            return username.substring(bankPrefix.length);
        }
        return null;
    };

    // Filtrer les comptes bancaires en fonction de la banque de l'utilisateur
    const filterAccountsByUserBank = (accounts) => {
        if (!Array.isArray(accounts)) return [];
        
        const userBankId = getUserBankId();
        if (!userBankId) return accounts;

        const userBank = AVAILABLE_BANKS.find(bank => bank.id === userBankId);
        if (!userBank) return accounts;

        return accounts.filter(account => 
            account.bankName && 
            account.bankName.toLowerCase() === userBank.name.toLowerCase()
        );
    };

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

    const handleDeactivateClick = () => {
        setIsDeactivationModalOpen(true);
    };

    const handleDeactivationConfirm = async (motif) => {
        if (!motif.trim()) {
            setError('Le motif est requis');
            return;
        }
    
        try {
            setDeactivationLoading(true);
            await deactivateClient(ubi, motif.trim());
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setDeactivationLoading(false);
            setIsDeactivationModalOpen(false);
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

    // Filtrer les comptes avant de les passer au composant BankAccountManagement
    const filteredAccounts = filterAccountsByUserBank(client.accountList);

    return (
        <>
            <div className="container mx-auto px-4 py-8">
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
                                accounts={filteredAccounts}
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
                            {client.isActive ? (
                                <button
                                    onClick={handleDeactivateClick}
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

            <DeactivationModal
                isOpen={isDeactivationModalOpen}
                onClose={() => setIsDeactivationModalOpen(false)}
                onConfirm={handleDeactivationConfirm}
                loading={deactivationLoading}
            />
        </>
    );
}

export default ClientDetails;
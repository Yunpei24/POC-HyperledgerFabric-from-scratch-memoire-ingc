// components/BankAccountManagement.js
import React, { useState, useEffect } from 'react';
import { addAccountToClient, removeAccount } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BANQUES = [
  { id: 'ecobank', name: 'Ecobank' },
  { id: 'corisbank', name: 'Corisbank' },
  { id: 'boa', name: 'Bank Of Africa' },
  { id: 'sgbf', name: 'Société Générale' },
  { id: 'bcb', name: 'Banque Commerciale du Burkina' },
  { id: 'ubabank', name: 'UBA Bank' },
  { id: 'biciab', name: 'BICIAB' },
];

const BankAccountManagement = ({ clientUBI, accounts, onAccountsChange }) => {
    const [newAccount, setNewAccount] = useState({ accountNumber: '', bankName: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // Obtenir la banque de l'utilisateur connecté
    const getUserBank = () => {
        if (!user?.username) return null;
        
        const bankPrefix = 'admin_';
        const username = user.username.toLowerCase();
        
        if (username.startsWith(bankPrefix)) {
            const bankId = username.substring(bankPrefix.length);
            return BANQUES.find(banque => banque.id === bankId);
        }
        return null;
    };

    // Filtrer la liste des banques pour n'afficher que celle de l'utilisateur
    const userBank = getUserBank();

    // Définir automatiquement la banque de l'utilisateur au chargement
    useEffect(() => {
        if (userBank) {
            setNewAccount(prev => ({ ...prev, bankName: userBank.name }));
        }
    }, [userBank]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAccount(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    const handleAddAccount = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (!newAccount.accountNumber || !newAccount.bankName) {
                throw new Error('Veuillez remplir tous les champs');
            }

            if (newAccount.accountNumber.length < 8) {
                throw new Error('Le numéro de compte doit contenir au moins 8 caractères');
            }

            const response = await addAccountToClient(clientUBI, {
                accountNumber: newAccount.accountNumber,
                bankName: newAccount.bankName
            });

            if (response.ubi) {
                throw new Error(response.message);
            }
            
            if (response) {
                onAccountsChange(response.accountList);
                setNewAccount({ accountNumber: '', bankName: '' });
            } else {
                throw new Error(response.message || 'Erreur lors de l\'ajout du compte');
            }
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAccount = async (accountNumber) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const response = await removeAccount(clientUBI, accountNumber);
            onAccountsChange(response.accountList);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Gestion des comptes bancaires</h3>
                <span className="text-sm text-gray-500">
                    {accounts?.length || 0} compte(s) enregistré(s)
                </span>
            </div>
     
            {/* Liste des comptes existants */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Comptes actuels</h4>
                {accounts && accounts.length > 0 ? (
                    <div className="space-y-3">
                        {accounts.map((account) => (
                            <div 
                                key={account.accountNumber}
                                className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-gray-200 transition-colors"
                            >
                                <div className="space-y-1">
                                    <div className="font-medium text-gray-900">{account.bankName}</div>
                                    <div className="text-sm text-gray-600">N° {account.accountNumber}</div>
                                </div>
                                <button
                                    onClick={() => handleRemoveAccount(account.accountNumber)}
                                    disabled={loading}
                                    className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Supprimer
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Aucun compte bancaire enregistré</p>
                        <p className="text-sm text-gray-400 mt-1">Utilisez le formulaire ci-dessous pour ajouter un compte</p>
                    </div>
                )}
            </div>
     
            {/* Formulaire d'ajout de compte */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-medium text-gray-800 mb-6">Ajouter un nouveau compte</h4>
                <form onSubmit={handleAddAccount} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Banque
                            </label>
                            {userBank ? (
                                <input
                                    type="text"
                                    value={userBank.name}
                                    disabled
                                    className="w-full rounded-lg border-gray-300 bg-gray-100 cursor-not-allowed"
                                />
                            ) : (
                                <select
                                    name="bankName"
                                    value={newAccount.bankName}
                                    onChange={handleInputChange}
                                    className="w-full rounded-lg border-gray-300"
                                    disabled
                                >
                                    <option value="">Non autorisé</option>
                                </select>
                            )}
                        </div>
     
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Numéro de compte
                            </label>
                            <input
                                type="text"
                                name="accountNumber"
                                value={newAccount.accountNumber}
                                onChange={handleInputChange}
                                placeholder={userBank ? `${userBank.id.toUpperCase().slice(0, 3)}XXXXX` : 'Non autorisé'}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                                minLength={8}
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Le numéro doit commencer par {userBank ? `${userBank.id.toUpperCase().slice(0, 3)}` : '---'} et contenir au moins 8 caractères
                            </p>
                        </div>
                    </div>
     
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}
     
                    <div className="flex items-center justify-between pt-4">
                        <p className="text-sm text-gray-500 italic">
                            Note: Un seul compte bancaire peut être associé au client
                        </p>
                        <button
                            type="submit"
                            disabled={loading || !newAccount.accountNumber || !userBank}
                            className={`flex justify-center py-2.5 px-8 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                                ${loading || !newAccount.accountNumber || !userBank
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                }`}
                        >
                            {loading ? 'Ajout en cours...' : 'Ajouter le compte'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
     );
};

export default BankAccountManagement;
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

// Liste des banques disponibles
const AVAILABLE_BANKS = [
    { id: 'ecobank', name: 'Ecobank' },
    { id: 'corisbank', name: 'Corisbank' },
    { id: 'boa', name: 'Bank Of Africa' },
    { id: 'sgbf', name: 'Société Générale' },
    { id: 'bcb', name: 'Banque Commerciale du Burkina' },
    { id: 'ubabank', name: 'UBA Bank' },
    { id: 'biciab', name: 'BICIAB' },
];

const BankAccountsSection = ({ accounts, onAccountsChange }) => {
    const [newAccount, setNewAccount] = useState({ accountNumber: '', bankName: '' });
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // Détermine la banque de l'utilisateur connecté
    // Mémoriser la fonction getUserBank
    const getUserBank = useCallback(() => {
        if (!user?.username) return null;
        
        const bankPrefix = 'admin_';
        const username = user.username.toLowerCase();
        
        if (username.startsWith(bankPrefix)) {
            const bankId = username.substring(bankPrefix.length);
            return AVAILABLE_BANKS.find(banque => banque.id === bankId);
        }
        return null;
    }, [user]); // Dépendance à user uniquement


    // Définir automatiquement la banque de l'utilisateur au chargement
    useEffect(() => {
        const bank = getUserBank();
        if (bank) {
            setNewAccount(prev => ({ ...prev, bankName: bank.name }));
        }
    }, [getUserBank]); // getUserBank est maintenant stable grâce à useCallback


    // Vérifie si un compte existe déjà
    const hasExistingAccount = accounts && accounts.length > 0;

    // Gestion de l'ajout d'un compte
    const handleAddAccount = () => {
        setError(null);

        if (!newAccount.accountNumber || !newAccount.bankName) {
            setError('Tous les champs sont requis');
            return;
        }

        // Vérification du format du numéro de compte selon la banque
        const userBank = getUserBank();
        if (!userBank) {
            setError('Utilisateur non autorisé');
            return;
        }

        const accountPrefix = userBank.id.toUpperCase().slice(0, 3);
        if (!newAccount.accountNumber.startsWith(accountPrefix)) {
            setError(`Le numéro de compte ${userBank.name} doit commencer par "${accountPrefix}"`);
            return;
        }

        if (newAccount.accountNumber.length < 8) {
            setError('Le numéro de compte doit contenir au moins 8 caractères');
            return;
        }

        // Ajout du compte
        onAccountsChange([{
            accountNumber: newAccount.accountNumber.trim(),
            bankName: newAccount.bankName.trim()
        }]);
        
        // Réinitialisation du formulaire
        setNewAccount(prev => ({ ...prev, accountNumber: '' }));
    };

    // Suppression d'un compte
    const handleRemoveAccount = () => {
        onAccountsChange([]);
    };

    // Récupération de la banque de l'utilisateur connecté
    const userBank = getUserBank();

    return (
        <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Compte Bancaire</h3>
            
            {hasExistingAccount ? (
                <div className="space-y-2">
                    {accounts.map((account, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm">
                            <div>
                                <span className="font-medium text-gray-700">{account.bankName}</span>
                                <span className="text-gray-600 ml-2">({account.accountNumber})</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleRemoveAccount}
                                className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                            >
                                Supprimer
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Banque
                            </label>
                            {userBank ? (
                                <input
                                    type="text"
                                    value={userBank.name}
                                    readOnly
                                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
                                />
                            ) : (
                                <select
                                    disabled
                                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
                                >
                                    <option value="">Non autorisé</option>
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Numéro de Compte
                            </label>
                            <input
                                type="text"
                                value={newAccount.accountNumber}
                                onChange={(e) => setNewAccount(prev => ({ 
                                    ...prev, 
                                    accountNumber: e.target.value.toUpperCase()
                                }))}
                                placeholder={userBank ? `${userBank.id.toUpperCase().slice(0, 3)}XXXXX` : 'Non autorisé'}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bceao-primary focus:ring-bceao-primary"
                                disabled={!userBank}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm mt-2">
                            {error}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleAddAccount}
                        disabled={!userBank || !newAccount.accountNumber}
                        className={`w-full py-2 px-4 rounded-md text-white 
                            ${(!userBank || !newAccount.accountNumber)
                                ? 'bg-gray-300 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        Ajouter le compte
                    </button>

                    <p className="text-sm text-gray-500 italic">
                        Note: Un seul compte bancaire peut être associé au client
                    </p>
                </div>
            )}
        </div>
    );
};

export default BankAccountsSection;
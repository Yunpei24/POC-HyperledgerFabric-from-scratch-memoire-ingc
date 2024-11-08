import React, { useState } from 'react';

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

    // Vérifie si un compte existe déjà
    const hasExistingAccount = accounts && accounts.length > 0;

    const handleAddAccount = () => {
        setError(null);

        if (!newAccount.accountNumber || !newAccount.bankName) {
            setError('Tous les champs sont requis');
            return;
        }

        // Vérification du format du numéro de compte
        if (newAccount.bankName === 'Ecobank' && !newAccount.accountNumber.startsWith('ECO')) {
            setError('Le numéro de compte Ecobank doit commencer par "ECO"');
            return;
        }

        if (newAccount.bankName === 'Corisbank' && !newAccount.accountNumber.startsWith('COR')) {
            setError('Le numéro de compte Corisbank doit commencer par "COR"');
            return;
        }

        onAccountsChange([newAccount]); // Remplace l'ancien compte s'il existe
        setNewAccount({ accountNumber: '', bankName: '' });
    };

    const handleRemoveAccount = () => {
        onAccountsChange([]);
    };

    return (
        <div className="space-y-4">
            <h3 className="font-medium text-gray-700">Compte Bancaire</h3>
            
            {/* Message si un compte existe déjà */}
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
                // Formulaire d'ajout de compte
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Banque
                            </label>
                            <select
                                value={newAccount.bankName}
                                onChange={(e) => setNewAccount(prev => ({ ...prev, bankName: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bceao-primary focus:ring-bceao-primary"
                            >
                                <option value="">Sélectionner une banque</option>
                                {AVAILABLE_BANKS.map(bank => (
                                    <option key={bank.id} value={bank.name}>
                                        {bank.name}
                                    </option>
                                ))}
                            </select>
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
                                placeholder={newAccount.bankName === 'Ecobank' ? 'ECOxxxx' : 
                                          newAccount.bankName === 'Corisbank' ? 'CORxxxx' : 'Numéro de compte'}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bceao-primary focus:ring-bceao-primary"
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
                        disabled={!newAccount.accountNumber || !newAccount.bankName}
                        className={`w-full py-2 px-4 rounded-md text-white 
                            ${(!newAccount.accountNumber || !newAccount.bankName) 
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
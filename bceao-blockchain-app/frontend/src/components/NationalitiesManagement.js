// components/NationalityManagement.js
import React, { useState } from 'react';
import { addNationality, removeNationality } from '../services/api';

const ID_TYPES = [
  { id: 'passport', name: 'Passeport' },
  { id: 'cni', name: 'Carte Nationale d\'Identité' },
  { id: 'cs', name: 'Carte de Séjour' },
  { id: 'cr', name: 'Carte de Résident' },
];

const COUNTRIES = [
  { id: 'bf', name: 'Burkina Faso' },
  { id: 'ml', name: 'Mali' },
  { id: 'sn', name: 'Sénégal' },
  { id: 'ci', name: 'Côte d\'Ivoire' },
  { id: 'tg', name: 'Togo' },
  { id: 'bj', name: 'Bénin' },
  { id: 'ne', name: 'Niger' },
  { id: 'gn', name: 'Guinée' },
];

const NationalityManagement = ({ clientUBI, nationalities, onNationalitiesChange }) => {
    const [newNationality, setNewNationality] = useState({
        countryName: '',
        idType: '',
        idNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewNationality(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    const handleAddNationality = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (!newNationality.countryName || !newNationality.idType || !newNationality.idNumber) {
                throw new Error('Veuillez remplir tous les champs');
            }

            // Validation du numéro de document selon le type
            if (newNationality.idType === 'Passeport' && !newNationality.idNumber.match(/^[A-Z0-9]{7,9}$/)) {
                throw new Error('Le numéro de passeport doit contenir entre 7 et 9 caractères alphanumériques');
            }

            if (newNationality.idType === 'Carte Nationale d\'Identité' && !newNationality.idNumber.match(/^[A-Z0-9]{10,14}$/)) {
                throw new Error('Le numéro de CNI doit contenir entre 10 et 14 caractères alphanumériques');
            }

            const response = await addNationality(clientUBI, {
                countryName: newNationality.countryName,
                idType: newNationality.idType,
                idNumber: newNationality.idNumber
            });
            
            if (response) {
                onNationalitiesChange(response.nationalities);
                setNewNationality({ countryName: '', idType: '', idNumber: '' });
            } else {
                console.log(response);
                throw new Error('Erreur lors de l\'ajout de la nationalité');
            }
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveNationality = async (countryName) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette nationalité ?')) {
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const response = await removeNationality(clientUBI, countryName);
            onNationalitiesChange(response.nationalities);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Gestion des nationalités</h3>
                <span className="text-sm text-gray-500">
                    {nationalities?.length || 0} nationalité(s) enregistrée(s)
                </span>
            </div>

            {/* Liste des nationalités existantes */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Nationalités actuelles</h4>
                {nationalities && nationalities.length > 0 ? (
                    <div className="space-y-3">
                        {nationalities.map((nationality) => (
                            <div 
                                key={nationality.countryName}
                                className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-gray-200 transition-colors"
                            >
                                <div className="space-y-1">
                                    <div className="font-medium text-gray-900">
                                        {nationality.countryName}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {nationality.idDocument.type} - N° {nationality.idDocument.number}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRemoveNationality(nationality.countryName)}
                                    disabled={loading || nationalities.length <= 1}
                                    className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={nationalities.length <= 1 ? "Impossible de supprimer la dernière nationalité" : ""}
                                >
                                    Supprimer
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Aucune nationalité enregistrée</p>
                        <p className="text-sm text-gray-400 mt-1">Utilisez le formulaire ci-dessous pour ajouter une nationalité</p>
                    </div>
                )}
            </div>

            {/* Formulaire d'ajout de nationalité */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h4 className="text-lg font-medium text-gray-800 mb-6">Ajouter une nouvelle nationalité</h4>
                <form onSubmit={handleAddNationality} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pays
                            </label>
                            <select
                                name="countryName"
                                value={newNationality.countryName}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            >
                                <option value="">Sélectionner un pays</option>
                                {COUNTRIES.map(country => (
                                    <option key={country.id} value={country.name}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type de document
                            </label>
                            <select
                                name="idType"
                                value={newNationality.idType}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            >
                                <option value="">Sélectionner un type</option>
                                {ID_TYPES.map(type => (
                                    <option key={type.id} value={type.name}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Numéro du document
                            </label>
                            <input
                                type="text"
                                name="idNumber"
                                value={newNationality.idNumber}
                                onChange={handleInputChange}
                                placeholder="Ex: B123456789"
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white 
                            ${loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }`}
                    >
                        {loading ? 'Ajout en cours...' : 'Ajouter la nationalité'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NationalityManagement;
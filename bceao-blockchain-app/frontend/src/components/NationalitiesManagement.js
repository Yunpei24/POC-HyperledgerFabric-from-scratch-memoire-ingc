// components/NationalityManagement.js
import React, { useState } from 'react';
import ImageUpload from './common/UploadImage';
import { ImagePreview } from './common/ImagePreview';
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
    { id: 'ci', name: "Côte d'Ivoire" },
    { id: 'tg', name: 'Togo' },
    { id: 'bj', name: 'Bénin' },
    { id: 'ne', name: 'Niger' },
    { id: 'gn', name: 'Guinée' },
];

const validateIdNumber = (type, number) => {
    switch (type) {
        case 'Passeport':
            return /^[A-Z0-9]{7,9}$/.test(number);
        case 'Carte Nationale d\'Identité':
            return /^[A-Z0-9]{10,14}$/.test(number);
        case 'Carte de Séjour':
            return /^[A-Z0-9]{10,14}$/.test(number);
        case 'Carte de Résident':
            return /^[A-Z0-9]{8,12}$/.test(number);
        default:
            return false;
    }
};

const NationalityManagement = ({ clientUBI, nationalities, onNationalitiesChange }) => {
    const [newNationality, setNewNationality] = useState({
        countryName: '',
        idDocument: {
            type: '',
            number: '',
            imageDocumentIdentification: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('idDocument.')) {
            const field = name.split('.')[1];
            setNewNationality(prev => ({
                ...prev,
                idDocument: {
                    ...prev.idDocument,
                    [field]: value
                }
            }));
        } else {
            setNewNationality(prev => ({
                ...prev,
                [name]: value
            }));
        }
        setError(null);
    };

    const handleImageChange = (imageData) => {
        setNewNationality(prev => ({
            ...prev,
            idDocument: {
                ...prev.idDocument,
                imageDocumentIdentification: imageData
            }
        }));
    };

    const handleAddNationality = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (!newNationality.countryName || 
                !newNationality.idDocument.type || 
                !newNationality.idDocument.number ||
                !newNationality.idDocument.imageDocumentIdentification) {
                throw new Error('Veuillez remplir tous les champs et fournir un document d\'identification');
            }

            if (!validateIdNumber(newNationality.idDocument.type, newNationality.idDocument.number)) {
                throw new Error(`Format invalide pour le numéro de ${newNationality.idDocument.type}`);
            }

            const response = await addNationality(clientUBI, newNationality);
            
            if (response && response.nationalities) {
                onNationalitiesChange(response.nationalities);
                // Réinitialiser le formulaire
                setNewNationality({
                    countryName: '',
                    idDocument: {
                        type: '',
                        number: '',
                        imageDocumentIdentification: ''
                    }
                });
            } else {
                throw new Error('Erreur lors de l\'ajout de la nationalité');
            }
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveNationality = async (countryName) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la nationalité ${countryName} ?`)) {
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await removeNationality(clientUBI, countryName);
            if (response && response.nationalities) {
                onNationalitiesChange(response.nationalities);
            } else {
                throw new Error('Erreur lors de la suppression de la nationalité');
            }
        } catch (err) {
            setError(err.message || 'Une erreur est survenue lors de la suppression');
        } finally {
            setLoading(false);
        }
    };

    const renderExistingNationalities = () => {
        if (!nationalities || nationalities.length === 0) {
            return (
                <div className="text-center py-8">
                    <p className="text-gray-500">Aucune nationalité enregistrée</p>
                    <p className="text-sm text-gray-400 mt-1">Utilisez le formulaire ci-dessous pour ajouter une nationalité</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {nationalities.map((nationality) => (
                    <div 
                        key={nationality.countryName}
                        className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                        <div className="flex justify-between">
                            <div className="space-y-2">
                                <div className="font-medium text-gray-900">
                                    {nationality.countryName}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {nationality.idDocument.type} - N° {nationality.idDocument.number}
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                {nationality.idDocument.imageDocumentIdentification && (
                                    <ImagePreview 
                                        imageData={nationality.idDocument.imageDocumentIdentification}
                                        className="h-20 w-32 object-cover rounded-md"
                                    />
                                )}
                                <button
                                    onClick={() => handleRemoveNationality(nationality.countryName)}
                                    disabled={loading || nationalities.length <= 1}
                                    className={`px-3 py-1 rounded-md text-sm transition-colors
                                        ${nationalities.length <= 1
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'text-red-600 hover:bg-red-600 hover:text-white'}`}
                                    title={nationalities.length <= 1 ? "Impossible de supprimer la dernière nationalité" : ""}
                                >
                                    {loading ? 'Suppression...' : 'Supprimer'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Gestion des Identités</h3>
                <span className="text-sm text-gray-500">
                    {nationalities?.length || 0} nationalité(s) enregistrée(s)
                </span>
            </div>

            {/* Liste des nationalités existantes */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Nationalités actuelles</h4>
                {renderExistingNationalities()}
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
                                name="idDocument.type"
                                value={newNationality.idDocument.type}
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
                                name="idDocument.number"
                                value={newNationality.idDocument.number}
                                onChange={handleInputChange}
                                placeholder="Ex: B123456789"
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <ImageUpload
                            name="Document d'identification"
                            value={newNationality.idDocument.imageDocumentIdentification}
                            onChange={handleImageChange}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2.5 px-4 rounded-lg shadow-sm text-white font-medium transition-colors
                            ${loading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
                    >
                        {loading ? 'Ajout en cours...' : 'Ajouter la nationalité'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NationalityManagement;
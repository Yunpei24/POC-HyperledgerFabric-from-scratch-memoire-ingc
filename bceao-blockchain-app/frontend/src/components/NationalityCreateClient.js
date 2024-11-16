// components/NationalitySection.js
import React, { useState } from 'react';
import ImageUpload from './common/UploadImage';

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

const NationalitySection = ({ nationalities, onNationalitiesChange }) => {
    const [newNationality, setNewNationality] = useState({
        countryName: '',
        idDocument: {
            type: '',
            number: '',
            imageDocumentIdentification: ''
        }
    });
    const [error, setError] = useState(null);

    // Vérifie si une nationalité existe déjà
    const hasExistingNationality = nationalities && nationalities.length > 0;

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
                return true;
        }
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

    const handleAddNationality = () => {
        setError(null);

        if (!newNationality.countryName || 
            !newNationality.idDocument.type || 
            !newNationality.idDocument.number ||
            !newNationality.idDocument.imageDocumentIdentification) {
            setError('Tous les champs sont requis, y compris le document d\'identification');
            return;
        }

        if (!validateIdNumber(newNationality.idDocument.type, newNationality.idDocument.number)) {
            setError(`Format invalide pour le numéro de ${newNationality.idDocument.type}`);
            return;
        }

        // Ajouter la nouvelle nationalité au tableau
        onNationalitiesChange([newNationality]);
        
        // Réinitialiser le formulaire
        setNewNationality({
            countryName: '',
            idDocument: {
                type: '',
                number: '',
                imageDocumentIdentification: ''
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-700">Nationalité et Document d'Identité</h3>
            </div>

            {hasExistingNationality ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="font-medium text-gray-700">
                                {nationalities[0].countryName}
                            </div>
                            <div className="text-sm text-gray-600">
                                {nationalities[0].idDocument.type} - N° {nationalities[0].idDocument.number}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onNationalitiesChange([])}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
                        >
                            Modifier
                        </button>
                    </div>

                    {nationalities[0].idDocument.imageDocumentIdentification && (
                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Document fourni</h4>
                            <img
                                src={nationalities[0].idDocument.imageDocumentIdentification}
                                alt="Document d'identification"
                                className="max-h-40 object-cover rounded-lg border border-gray-200"
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Pays
                            </label>
                            <select
                                value={newNationality.countryName}
                                onChange={(e) => setNewNationality(prev => ({ 
                                    ...prev, 
                                    countryName: e.target.value 
                                }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bceao-primary focus:ring-bceao-primary"
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
                            <label className="block text-sm font-medium text-gray-700">
                                Type de Document
                            </label>
                            <select
                                value={newNationality.idDocument.type}
                                onChange={(e) => setNewNationality(prev => ({ 
                                    ...prev, 
                                    idDocument: { ...prev.idDocument, type: e.target.value }
                                }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bceao-primary focus:ring-bceao-primary"
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
                            <label className="block text-sm font-medium text-gray-700">
                                Numéro du Document
                            </label>
                            <input
                                type="text"
                                value={newNationality.idDocument.number}
                                onChange={(e) => setNewNationality(prev => ({ 
                                    ...prev, 
                                    idDocument: { ...prev.idDocument, number: e.target.value.toUpperCase() }
                                }))}
                                placeholder="Ex: B123456789"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bceao-primary focus:ring-bceao-primary"
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
                        <div className="text-red-600 text-sm mt-2">
                            {error}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleAddNationality}
                        disabled={!newNationality.countryName || 
                                !newNationality.idDocument.type || 
                                !newNationality.idDocument.number ||
                                !newNationality.idDocument.imageDocumentIdentification}
                        className={`w-full py-2 px-4 rounded-md text-white 
                            ${(!newNationality.countryName || 
                               !newNationality.idDocument.type || 
                               !newNationality.idDocument.number ||
                               !newNationality.idDocument.imageDocumentIdentification)
                                ? 'bg-gray-300 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700'}`}
                    >
                        Ajouter la nationalité
                    </button>
                </div>
            )}
        </div>
    );
};

export default NationalitySection;
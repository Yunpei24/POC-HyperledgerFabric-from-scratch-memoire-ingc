// frontend/src/components/ClientForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createClient, updateClient, getClient } from '../services/api';
import BankAccountsSection from './BankAccountAddingCreate';
import SimilarityAlert from './SimilarityAlert';


// Composant pour le téléchargement d'image
const ImageUpload = ({ value, onChange }) => {
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
                alert('Format d\'image invalide. Utilisez JPEG, PNG ou JPG.');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                alert('L\'image est trop grande. Taille maximale: 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                onChange(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
                Document d'identification
            </label>
            <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleImageChange}
                className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
            />
            {value && (
                <div className="mt-2">
                    <img
                        src={value}
                        alt="Aperçu du document"
                        className="h-32 object-cover rounded"
                    />
                </div>
            )}
            <p className="text-sm text-gray-500 mt-1">
                Formats acceptés: JPEG, PNG, JPG. Taille maximale: 2MB
            </p>
        </div>
    );
};

// Composant principal du formulaire
function ClientForm() {
    const { ubi } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [similarities, setSimilarities] = useState(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        email: '',
        accountList: [],
        nationalities: [],
        imageDocumentIdentification: ''
    });

    const handleAccountsChange = (newAccounts) => {
        setFormData(prev => ({ ...prev, accountList: newAccounts }));
    };

    const UEMOA_COUNTRIES = [
        { code: 'BEN', name: 'Bénin' },
        { code: 'BFA', name: 'Burkina Faso' },
        { code: 'CIV', name: 'Côte d\'Ivoire' },
        { code: 'GNB', name: 'Guinée-Bissau' },
        { code: 'MLI', name: 'Mali' },
        { code: 'NER', name: 'Niger' },
        { code: 'SEN', name: 'Sénégal' },
        { code: 'TGO', name: 'Togo' }
    ];

    useEffect(() => {
        const fetchClient = async () => {
            if (ubi) {
                try {
                    setLoading(true);
                    const data = await getClient(ubi);
                    setFormData(data);
                } catch (err) {
                    setError("Erreur lors du chargement du client");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchClient();
    }, [ubi]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNationalityChange = (e) => {
        const value = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({ ...prev, nationalities: value }));
    };

    const handleImageChange = (imageData) => {
        setFormData(prev => ({ ...prev, imageDocumentIdentification: imageData }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            setSimilarities(null);
    
            // Formatage des données avant envoi
            const submitData = {
                ...formData,
                // S'assurer que accountList est un tableau
                accountList: Array.isArray(formData.accountList) 
                    ? formData.accountList 
                    : [],
                // S'assurer que nationalities est un tableau
                nationalities: Array.isArray(formData.nationalities) 
                    ? formData.nationalities 
                    : []
            };
                
            if (ubi) {
                await updateClient(ubi, submitData);
                navigate('/');
            } else {
                const response = await createClient(submitData);
                if (response.similitude) {
                    setSimilarities(response);
                } else {
                    navigate('/');
                }
            }
        } catch (err) {
            console.error('Erreur lors de la soumission:', err);
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bceao-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {similarities && (
                <SimilarityAlert
                    similarities={similarities}
                    onClose={() => setSimilarities(null)}
                />
            )}

            <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-bceao-primary text-white">
                    <h2 className="text-xl font-bold">
                        {ubi ? 'Modifier le Client' : 'Nouveau Client'}
                    </h2>
                </div>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Prénom
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bceao-primary focus:ring-bceao-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Nom
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bceao-primary focus:ring-bceao-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bceao-primary focus:ring-bceao-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Date de Naissance
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bceao-primary focus:ring-bceao-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Genre
                            </label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bceao-primary focus:ring-bceao-primary"
                                required
                            >
                                <option value="">Sélectionner</option>
                                <option value="M">Masculin</option>
                                <option value="F">Féminin</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Nationalités
                            </label>
                            <select
                                multiple
                                name="nationalities"
                                value={formData.nationalities}
                                onChange={handleNationalityChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bceao-primary focus:ring-bceao-primary"
                                required
                            >
                                {UEMOA_COUNTRIES.map(country => (
                                    <option key={country.code} value={country.code}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-sm text-gray-500 mt-1">
                                Maintenez Ctrl pour sélectionner plusieurs nationalités
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <BankAccountsSection
                            accounts={formData.accountList}
                            onAccountsChange={handleAccountsChange}
                        />
                    </div>

                    <ImageUpload
                        value={formData.imageDocumentIdentification}
                        onChange={handleImageChange}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 rounded-md text-white
                                ${loading ? 'bg-gray-400' : 'bg-bceao-primary hover:bg-blue-700'}
                                transition-colors duration-200`}
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enregistrement...
                                </div>
                            ) : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ClientForm;
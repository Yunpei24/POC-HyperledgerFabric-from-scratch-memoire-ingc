// frontend/src/components/ClientForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createClient, updateClient, getClient } from '../services/api';

function ClientForm() {
    const { ubi } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        ubi: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        email: '',
        accountList: [],
        nationalities: [],
        imageDocumentIdentification: ''
    });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            // Créer un objet avec seulement les champs modifiables
            const updateData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                email: formData.email,
                nationality: formData.nationality
            };
    
            if (ubi) {
                // Mise à jour
                await updateClient(ubi, updateData);
            } else {
                // Création
                await createClient(formData);
            }
            
            navigate('/');
        } catch (err) {
            setError(err.message);
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
                                UBI
                            </label>
                            <input
                                type="text"
                                name="ubi"
                                value={formData.ubi}
                                onChange={handleChange}
                                disabled={!!ubi}
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
                    </div>

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
                            className="px-4 py-2 bg-bceao-primary text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ClientForm;
// components/common/ClientSearchBar.js
import React, { useState, useEffect } from 'react';

const ClientSearchBar = ({ onSearch }) => {
    const [searchParams, setSearchParams] = useState({
        ubi: '',
        firstName: '',
        lastName: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Recherche à chaque changement des paramètres
    useEffect(() => {
        onSearch(searchParams);
    }, [searchParams, onSearch]);

    return (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Recherche par UBI */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rechercher par UBI
                    </label>
                    <input
                        type="text"
                        name="ubi"
                        value={searchParams.ubi}
                        onChange={handleChange}
                        placeholder="UEMOA-2024-000..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-bceao-primary focus:border-bceao-primary"
                    />
                </div>

                {/* Recherche par Nom */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rechercher par Nom
                    </label>
                    <input
                        type="text"
                        name="lastName"
                        value={searchParams.lastName}
                        onChange={handleChange}
                        placeholder="Nom de famille"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-bceao-primary focus:border-bceao-primary"
                    />
                </div>

                {/* Recherche par Prénom */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rechercher par Prénom
                    </label>
                    <input
                        type="text"
                        name="firstName"
                        value={searchParams.firstName}
                        onChange={handleChange}
                        placeholder="Prénom"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-bceao-primary focus:border-bceao-primary"
                    />
                </div>
            </div>
        </div>
    );
};

export default ClientSearchBar;
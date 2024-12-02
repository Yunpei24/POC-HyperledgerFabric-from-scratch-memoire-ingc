import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getClient, updateClient } from '../services/api';
import BankAccountManagement from './BankAccountManagement';
import NationalityManagement from './NationalitiesManagement';

function UpdateClient() {
  const { ubi } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState({
    UBI: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    imageDocumentIdentification: '',
    nationalities: [],
    accountList: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


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
    setClient((prevClient) => ({
      ...prevClient,
      nationalities: newNationalities
    }));
  };

  const handleAccountsChange = (newAccounts) => {
    setClient((prevClient) => ({
      ...prevClient,
      accountList: newAccounts
    }));
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const updatedData = {
        firstName: client.firstName,
        lastName: client.lastName,
        dateOfBirth: client.dateOfBirth,
        gender: client.gender,
        email: client.email,
        imageDocumentIdentification: client.imageDocumentIdentification
      };
      const updatedClient = await updateClient(ubi, updatedData);
      setClient(updatedClient);
      navigate(`/clients/${ubi}`);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la mise à jour');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-bceao-primary text-white px-6 py-4">
          <h2 className="text-2xl font-bold">Modifier les informations du client</h2>
        </div>

        <div className="p-6">
          <form onSubmit={handleUpdateClient}>
            {/* Informations générales du client */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={client.lastName}
                  onChange={(e) =>
                    setClient((prevClient) => ({
                      ...prevClient,
                      lastName: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={client.firstName}
                  onChange={(e) =>
                    setClient((prevClient) => ({
                      ...prevClient,
                      firstName: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  Date de naissance
                </label>
                <input
                  type="text"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={client.dateOfBirth}
                  onChange={(e) =>
                    setClient((prevClient) => ({
                      ...prevClient,
                      dateOfBirth: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Genre
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={client.gender}
                  onChange={(e) =>
                    setClient((prevClient) => ({
                      ...prevClient,
                      gender: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un genre</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={client.email}
                  onChange={(e) =>
                    setClient((prevClient) => ({
                      ...prevClient,
                      email: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="mt-8 flex justify-end space-x-4">
              <Link
                to={`/`}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Link>
              <button
                type="submit"
                className="px-4 py-2 bg-bceao-secondary text-bceao-primary rounded-md hover:bg-yellow-500"
              >
                Mettre à jour
              </button>
            </div>
          </form>

          {/* Section des informations supplémentaires */}
          <div className="mt-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations complémentaires</h2>
              
              {/* Nationalités et Document d'identification */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Nationalités</h3>
                    <NationalityManagement
                      clientUBI={client.UBI}
                      nationalities={client.nationalities}
                      onNationalitiesChange={handleNationalitiesChange}
                    />
                  </div>
                </div>
              </div>

              {/* Comptes bancaires */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Comptes bancaires</h3>
                <BankAccountManagement
                  clientUBI={client.UBI}
                  accounts={client.accountList}
                  onAccountsChange={handleAccountsChange}
                />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default UpdateClient;
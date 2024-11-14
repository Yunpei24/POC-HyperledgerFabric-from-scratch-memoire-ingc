// frontend/src/components/common/ClientSearchBar.js
import React, { useState, useEffect } from 'react';
import { searchClientsByFace } from '../../services/api';

const ClientSearchBar = ({ onSearch, clients }) => {
  const [searchParams, setSearchParams] = useState({
      imageFace: null,
      firstName: '',
      lastName: '',
      ubi: ''
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = async (file) => {
      if (file) {
          try {
              setLoading(true);
              const imageUrl = URL.createObjectURL(file);
              setPreviewImage(imageUrl);
              setSearchParams(prev => ({ ...prev, imageFace: file }));

              // Vérifier que nous avons des clients avec des images
              const clientsWithImages = clients.filter(client => client.imageFace);
              if (clientsWithImages.length === 0) {
                  throw new Error("Aucun client avec photo à comparer");
              }

              const similarClients = await searchClientsByFace(file, clientsWithImages);
              onSearch({ 
                  type: 'FACE',
                  result: similarClients,
                  searchType: 'Face Recognition'
              });
          } catch (error) {
              console.error('Erreur reconnaissance faciale:', error);
              onSearch({ 
                  type: 'FACE', 
                  result: null, 
                  error: error.message,
                  searchType: 'Face Recognition'
              });
          } finally {
              setLoading(false);
          }
      }
  };

  const handleRemoveImage = () => {
      setPreviewImage(null);
      setSearchParams(prev => ({ ...prev, imageFace: null }));
      // Réinitialiser la recherche par texte
      onSearch({
          type: 'TEXT',
          params: {
              firstName: searchParams.firstName,
              lastName: searchParams.lastName,
              ubi: searchParams.ubi
          }
      });
  };

  const handleTextChange = (e) => {
      const { name, value } = e.target;
      setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const resetSearch = () => {
      setSearchParams({
          imageFace: null,
          firstName: '',
          lastName: '',
          ubi: ''
      });
      setPreviewImage(null);
      onSearch({
          type: 'TEXT',
          params: { firstName: '', lastName: '', ubi: '' }
      });
  };

  useEffect(() => {
      if (!searchParams.imageFace) {
          const debounceTimeout = setTimeout(() => {
              onSearch({
                  type: 'TEXT',
                  params: {
                      firstName: searchParams.firstName,
                      lastName: searchParams.lastName,
                      ubi: searchParams.ubi
                  }
              });
          }, 300);

          return () => clearTimeout(debounceTimeout);
      }
  }, [searchParams.firstName, searchParams.lastName, searchParams.ubi, onSearch, searchParams.imageFace]);

  return (
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rechercher par image
                  </label>
                  <div className="flex items-center">
                      {previewImage ? (
                          <div className="relative mr-4">
                              <img
                                  src={previewImage}
                                  alt="Preview"
                                  className="h-12 w-12 rounded-full object-cover"
                              />
                              <button
                                  onClick={handleRemoveImage}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                  title="Supprimer l'image"
                              >
                                  ×
                              </button>
                          </div>
                      ) : (
                          <div className="relative">
                              <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageChange(e.target.files[0])}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                  disabled={loading}
                              />
                          </div>
                      )}
                  </div>
                  {loading && (
                      <div className="mt-2 text-sm text-gray-500">
                          Comparaison en cours...
                      </div>
                  )}
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                      UBI
                  </label>
                  <input
                      type="text"
                      name="ubi"
                      value={searchParams.ubi}
                      onChange={handleTextChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Numéro UBI"
                      disabled={!!searchParams.imageFace}
                  />
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom
                  </label>
                  <input
                      type="text"
                      name="lastName"
                      value={searchParams.lastName}
                      onChange={handleTextChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Nom de famille"
                      disabled={!!searchParams.imageFace}
                  />
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom
                  </label>
                  <input
                      type="text"
                      name="firstName"
                      value={searchParams.firstName}
                      onChange={handleTextChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Prénom"
                      disabled={!!searchParams.imageFace}
                  />
              </div>
          </div>
          
          <div className="mt-4 flex justify-end">
              <button
                  onClick={resetSearch}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                  Réinitialiser la recherche
              </button>
          </div>
      </div>
  );
};

export default ClientSearchBar;
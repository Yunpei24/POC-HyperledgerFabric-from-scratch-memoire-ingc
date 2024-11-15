import { useNavigate } from 'react-router-dom';

const SimilarityAlert = ({ similarities, onClose }) => {
    const navigate = useNavigate();

    if (!similarities || !similarities.similarClients || similarities.similarClients.length === 0) {
        return null;
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const formatNationalities = (nationalities) => {
        if (!nationalities || !Array.isArray(nationalities)) return 'Non spécifié';
        return (
          <div className="ml-4">
            {nationalities.map((nationality, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <p className="text-sm">
                    {nationality.countryName} :
                </p>
                <p>
                    {nationality.idDocument.type} : {nationality.idDocument.number}
                </p>
            </div>
            ))}
          </div>
        );
    };

    const handleUpdateClient = (ubi) => {
        onClose();
        navigate(`/clients/${ubi}/update`);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full my-8">
                <div className="px-6 py-4 bg-red-600 text-white flex justify-between items-center">
                    <h3 className="text-xl font-semibold">⚠️ Similitudes détectées</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl font-bold">×</button>
                </div>
                <div className="p-6 flex flex-col">
                    {/* Zone scrollable */}
                    <div className="overflow-y-auto mb-4" style={{ maxHeight: 'calc(70vh - 120px)' }}>
                        <div className="mb-4">
                            <h4 className="text-lg font-semibold mb-2">Client que vous essayez de créer :</h4>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p><span className="font-semibold">Nom :</span> {similarities.potentialClient.lastName}</p>
                                <p><span className="font-semibold">Prénom :</span> {similarities.potentialClient.firstName}</p>
                                <p><span className="font-semibold">Date de naissance :</span> {formatDate(similarities.potentialClient.dateOfBirth)}</p>
                                <p><span className="font-semibold">Email :</span> {similarities.potentialClient.email}</p>
                                <p><span className="font-semibold">Nationalités :</span> {formatNationalities(similarities.potentialClient.nationalities)}</p>
                            </div>
                        </div>
    
                        <h4 className="text-lg font-semibold mb-2">Clients similaires trouvés :</h4>
                        <div className="space-y-4">
                            {similarities.similarClients.map((client, index) => (
                                <div key={index} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-lg">{client.existingClient.firstName} {client.existingClient.lastName}</p>
                                            <p className="text-sm text-gray-600"><span className="font-bold">UBI: </span>{client.existingClient.UBI}</p>
                                        </div>
                                        <div className="bg-yellow-100 px-3 py-1 rounded-full">
                                            <span className="text-yellow-800">
                                                Score de similarité: {client.matchScore}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <p><span className="font-semibold">Date de naissance:</span> {formatDate(client.existingClient.dateOfBirth)}</p>
                                            <p><span className="font-semibold">Email:</span> {client.existingClient.email}</p>
                                        </div>
                                        <div className="flex items-end justify-end">
                                            {client.matchDetails && (
                                                <div className="mr-4">
                                                    <p className="font-semibold text-yellow-700">Détails des correspondances:</p>
                                                    <ul className="list-disc list-inside text-sm">
                                                        {client.matchDetails.map((detail, idx) => (
                                                            <li key={idx}>{detail}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => handleUpdateClient(client.existingClient.UBI)}
                                                className="px-3 py-1.5 bg-blue-400 text-white rounded-md hover:bg-blue-500"
                                            >
                                                Modifier
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
    
                    {/* Footer fixe */}
                    <div className="mt-auto border-t pt-4 bg-white">
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            >
                                Modifier les informations
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimilarityAlert;
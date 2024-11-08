const SimilarityAlert = ({ similarities, onClose }) => {
    if (!similarities || !similarities.similarClients || similarities.similarClients.length === 0) {
        return null;
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
                <div className="px-6 py-4 bg-red-600 text-white flex justify-between items-center">
                    <h3 className="text-xl font-semibold">⚠️ Similitudes détectées</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl font-bold">×</button>
                </div>
                <div className="p-6 overflow-auto">
                    <div className="mb-4">
                        <h4 className="text-lg font-semibold mb-2">Client que vous essayez de créer :</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p><span className="font-semibold">Nom :</span> {similarities.potentialClient.lastName}</p>
                            <p><span className="font-semibold">Prénom :</span> {similarities.potentialClient.firstName}</p>
                            <p><span className="font-semibold">Date de naissance :</span> {formatDate(similarities.potentialClient.dateOfBirth)}</p>
                            <p><span className="font-semibold">Email :</span> {similarities.potentialClient.email}</p>
                            <p><span className="font-semibold">Nationalités :</span> {similarities.potentialClient.nationalities.join(', ')}</p>
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
                                    <div>
                                        {client.matchDetails && (
                                            <div>
                                                <p className="font-semibold text-yellow-700">Détails des correspondances:</p>
                                                <ul className="list-disc list-inside text-sm">
                                                    {client.matchDetails.map((detail, idx) => (
                                                        <li key={idx}>{detail}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end space-x-4">
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
    );
};

export default SimilarityAlert;
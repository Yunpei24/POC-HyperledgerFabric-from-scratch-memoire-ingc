// components/modals/DeactivationModal.js
import React, { useState } from 'react';

const ActivationModal = ({ isOpen, onClose, onConfirm, loading }) => {
    const [motif, setMotif] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm(motif);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-xl font-bold mb-4">Demande de activation</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Motif de l'activation
                        </label>
                        <textarea
                            value={motif}
                            onChange={(e) => setMotif(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            rows="4"
                            required
                            placeholder="Veuillez saisir le motif de la désactivation..."
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                            disabled={!motif.trim() || loading}
                        >
                            {loading ? 'En cours...' : 'Confirmer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActivationModal;
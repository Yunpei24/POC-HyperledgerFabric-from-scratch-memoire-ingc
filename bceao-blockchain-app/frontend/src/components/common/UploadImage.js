import React from 'react';

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

export default ImageUpload;
// frontend/src/components/common/ImagePreview.js
import React, { useState } from 'react';

const ImagePreview = ({ imageData }) => {
    const [showModal, setShowModal] = useState(false);

    if (!imageData) return null;

    return (
        <>
            {/* Miniature cliquable */}
            <div className="cursor-pointer" onClick={() => setShowModal(true)}>
                <img
                    src={imageData}
                    alt="Document d'identification"
                    className="h-40 object-cover rounded-lg border border-gray-200 hover:border-bceao-primary transition-colors"
                />
                <p className="text-sm text-gray-500 mt-1">Cliquez pour agrandir</p>
            </div>

            {/* Modal pour l'image en grand */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                     onClick={() => setShowModal(false)}>
                    <div className="relative max-w-4xl w-full bg-white rounded-lg p-2">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                        >
                            ×
                        </button>
                        <img
                            src={imageData}
                            alt="Document d'identification"
                            className="w-full h-auto rounded-lg"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

const PhotoPreview = ({ imageData }) => {
  const [showModal, setShowModal] = useState(false);

  if (!imageData) {
    return (
      <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-gray-500">N/A</span>
      </div>
    );
  }

  return (
    <>
      <div className="cursor-pointer" onClick={() => setShowModal(true)}>
        <img
          src={imageData}
          alt="Profile"
          className="h-12 w-12 rounded-full object-cover hover:opacity-80 transition-opacity"
        />
      </div>

      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div className="relative max-w-4xl w-full bg-white rounded-lg p-2">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
            <img
              src={imageData}
              alt="Profile"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export { ImagePreview, PhotoPreview};
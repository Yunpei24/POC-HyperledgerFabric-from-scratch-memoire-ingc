import React from 'react';

function DocumentPreview({ imageData }) {
  if (!imageData) return null;

  // Décodage de l'image base64
  const imageUrl = imageData.startsWith('data:image') 
    ? imageData 
    : `data:image/jpeg;base64,${imageData}`;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Document d'identification</h3>
      <div className="border rounded-lg p-2">
        <img 
          src={imageUrl} 
          alt="Document d'identification" 
          className="max-w-full h-auto rounded"
        />
      </div>
    </div>
  );
}

export default DocumentPreview;
import React, { useState, useEffect } from "react";

const ImageViewer = ({ imageUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => setIsLoading(false);
    img.onerror = () => setIsLoading(false); // Handle error loading image
  }, [imageUrl]);

  return (
    <div>
      {/* Thumbnail or Small Image */}
      {isLoading ? (
        <div className="loader">Loading...</div>
      ) : (
        <img
          src={imageUrl}
          alt="Thumbnail"
          className="w-32 h-auto rounded cursor-pointer"
          onClick={() => setIsOpen(true)}
        />
      )}

      {/* Modal for Full Image Preview */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)} // Close modal on clicking the background
        >
          <div className="relative">
            <img
              src={imageUrl}
              alt="Full Preview"
              className="w-100% rounded-lg"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white bg-gray-800 px-3 py-1 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageViewer;

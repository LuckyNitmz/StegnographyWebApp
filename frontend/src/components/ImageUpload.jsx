import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import '../styles/ImageUpload.css'; // Your existing CSS file

const ImageUpload = ({ onImageSelect, selectedImage }) => {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
  if (!selectedImage) {
    setPreview(null);
    return;
  }
  const objectUrl = URL.createObjectURL(selectedImage);
  setPreview(objectUrl);

  // Clean up URL object when component unmounts or selectedImage changes
  return () => URL.revokeObjectURL(objectUrl);
}, [selectedImage]);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);
    if (rejectedFiles.length > 0) {
      setError('Invalid file type or file too large');
      return;
    }
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onImageSelect(file);

      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    multiple: false,
    maxSize: 30 * 1024 * 1024,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`upload-area ${isDragActive ? 'active' : ''} ${preview ? 'has-image' : ''}`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <img src={preview} alt="Selected" className="upload-preview" />
        ) : (
          <>
            <svg className="upload-icon" viewBox="0 0 24 24" width="50" height="50" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="upload-text">Drag & drop image here, or click to select file</p>
            <p className="upload-info">Supported formats: PNG, JPG, JPEG | Max size: 30MB</p>
          </>
        )}
      </div>
      {error && <p className="upload-error">{error}</p>}
    </div>
  );
};

export default ImageUpload;

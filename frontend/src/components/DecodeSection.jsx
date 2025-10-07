import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import axios from 'axios';
import '../styles/DecodeSection.css';
import '../styles/Loader.css';

const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://steganography-backend-6hok.onrender.com'
    : 'http://localhost:3001');

const DecodeSection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [decodedMessage, setDecodedMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleDecode = async (e) => {
    e.preventDefault();
    setError(null);
    setDecodedMessage(null);

    if (!selectedImage) {
      setError('Please select an image');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    // Check file size (10MB limit)
    if (selectedImage.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('password', password);

      console.log('Sending decode request...', {
        filename: selectedImage.name,
        size: selectedImage.size
      });

      const response = await axios.post(`${API_URL}/api/decode`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      console.log('Decode response:', response.data);

      if (response.data.success) {
        setDecodedMessage(response.data.decoded_message);
      } else {
        setError('Failed to decode message');
      }
    } catch (err) {
      console.error('Decode error:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again with a smaller image.');
      } else if (err.response) {
        setError(err.response.data?.error || 'An error occurred during decoding');
      } else if (err.request) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPassword('');
    setDecodedMessage(null);
    setError(null);
  };

  return (
    <div className="decode-section">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
          <div className="loader-text">Decoding message from image...</div>
        </div>
      )}
      <h2>🔓 Decode - Extract Information from Image</h2>
      
      <form onSubmit={handleDecode} className="decode-form">
        <div className="form-group">
          <label>Upload Encrypted Image</label>
          <ImageUpload 
            onImageSelect={setSelectedImage} 
            selectedImage={selectedImage}
          />
          {selectedImage && (
            <p className="file-info">
              Selected: {selectedImage.name} ({(selectedImage.size / 1024).toFixed(2)} KB)
            </p>
          )}
          <p className="supported-formats">Supported formats: PNG, JPG, JPEG (Max 30MB)</p>
        </div>

        <div className="form-group">
          <label htmlFor="decode-password">Password</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="decode-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter the password to decrypt"
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94l0-0" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Decoding...' : 'Decode Message'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleReset} disabled={loading}>
            Reset
          </button>
        </div>
      </form>

      {decodedMessage && (
        <div className="result-section">
          <h3>✅ Message Decoded Successfully!</h3>
          <div className="decoded-message">
            <p>{decodedMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecodeSection;

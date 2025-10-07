import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import axios from 'axios';
import '../styles/EncodeSection.css';
import '../styles/Loader.css';

const API_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://steganography-backend-6hok.onrender.com'
    : 'http://localhost:3001');

const EncodeSection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [encodedImage, setEncodedImage] = useState(null);
  const [error, setError] = useState(null);

  const handleEncode = async (e) => {
    e.preventDefault();
    setError(null);
    setEncodedImage(null);

    if (!selectedImage) {
      setError('Please select an image');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('message', message);
      formData.append('password', password);

      const response = await axios.post(`${API_URL}/api/encode`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setEncodedImage(response.data.image);
      } else {
        setError('Failed to encode message');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred during encoding');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (encodedImage) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${encodedImage}`;
      link.download = 'encrypted_image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setMessage('');
    setPassword('');
    setEncodedImage(null);
    setError(null);
  };

  return (
    <div className="encode-section">
      {loading && (
        <div className="loader-overlay">
          <div className="loader"></div>
          <div className="loader-text">Encoding message in image...</div>
        </div>
      )}
      <h2>🔒 Encode - Hide Information in Image</h2>
      
      <form onSubmit={handleEncode} className="encode-form">
        <div className="form-group">
          <label>Upload Image</label>
          <ImageUpload 
            onImageSelect={setSelectedImage} 
            selectedImage={selectedImage}
          />
          <p className="supported-formats">Supported formats: PNG, JPG, JPEG (Max 30MB)</p>
        </div>

        <div className="form-group">
          <label htmlFor="message">Secret Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your secret message here..."
            rows="4"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a password to protect your message"
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
            {loading ? 'Encoding...' : 'Encode Message'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleReset} disabled={loading}>
            Reset
          </button>
        </div>
      </form>

      {encodedImage && (
        <div className="result-section">
          <h3>✅ Message Encoded Successfully!</h3>
          <div className="encoded-preview">
            <img src={`data:image/png;base64,${encodedImage}`} alt="Encoded" />
          </div>
          <button onClick={handleDownload} className="btn btn-download">
            Download Encrypted Image
          </button>
        </div>
      )}
    </div>
  );
};

export default EncodeSection;

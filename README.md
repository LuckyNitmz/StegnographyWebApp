# Steganography Web App

A full-stack web application that allows users to hide and extract secret messages within images using steganography techniques.

## Features

- 🔒 **Hide messages** in images with password protection
- 🔓 **Extract messages** from encoded images
- 👁️ **Password visibility toggle** with eye icon
- 🖼️ **Support for multiple image formats** (PNG, JPG, JPEG)
- 🔐 **Secure encryption** with password-based protection
- 📱 **Responsive design** for mobile and desktop

## Architecture

The application consists of three main components:

### Frontend (React)
- Built with React.js and modern CSS
- Interactive UI with drag-and-drop file upload
- Password visibility toggle feature
- Responsive design with glassmorphism effects

### Backend (Node.js)
- Express.js REST API
- File upload handling with Multer
- Proxy requests to Python API
- CORS enabled for cross-origin requests

### Python API (Flask)
- Steganography algorithms using OpenCV
- LSB (Least Significant Bit) encoding/decoding
- Password-based message protection
- Image processing and validation

## Local Development

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd StegnographyWebApp
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm start
   ```

4. **Python API Setup**
   ```bash
   cd python-api
   pip install -r requirements.txt
   python app.py
   ```

## Deployment

### Frontend (Vercel)
- Deploy to Vercel for free static hosting
- Automatic builds from git pushes
- Global CDN and SSL included

### Backend (Render)
- Deploy Node.js backend to Render
- Free tier with 750 hours/month
- Automatic deployments from git

### Python API (Render)
- Deploy Flask API to Render
- Python runtime support
- Environment variables for configuration

## Environment Variables

### Backend (.env)
```
PORT=3001
PYTHON_API_URL
```

### Frontend (.env)
```
REACT_APP_API_URL
```
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:5000';

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer with explicit limits
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 30 * 1024 * 1024, // 30MB limit
    fieldSize: 30 * 1024 * 1024,
    files: 1
  }
});

// Error handler for multer
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large. Maximum size is 30MB.' });
    }
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  } else if (err) {
    console.error('Unknown error:', err);
    return res.status(500).json({ error: err.message });
  }
  next();
};

// Root route for quick status
app.get('/', (req, res) => {
  res.json({
    message: 'Steganography backend is running',
    endpoints: ['/health', '/test-python', '/api/encode', '/api/decode']
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', message: 'Node.js backend is running' });
});

// Test Python API connection
app.get('/test-python', async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_API_URL}/health`);
    res.json({ 
      status: 'success', 
      message: 'Connected to Python API', 
      pythonResponse: response.data 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Cannot connect to Python API',
      error: error.message,
      pythonApiUrl: PYTHON_API_URL
    });
  }
});

// Encode endpoint
app.post('/api/encode', (req, res) => {
  const uploadHandler = upload.single('image');
  
  uploadHandler(req, res, async (err) => {
    // Handle multer errors
    if (err) {
      console.error('Upload error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File is too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(500).json({ error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      if (!req.body.message) {
        return res.status(400).json({ error: 'No message provided' });
      }

      if (!req.body.password) {
        return res.status(400).json({ error: 'No password provided' });
      }

      console.log('Encoding - File received:', req.file.originalname, 'Size:', req.file.size);

      // Create form data to send to Python API
      const formData = new FormData();
      formData.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });
      formData.append('message', req.body.message);
      formData.append('password', req.body.password);

      // Forward request to Python API
      const response = await axios.post(`${PYTHON_API_URL}/encode`, formData, {
        headers: {
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 30000
      });

      console.log('Encoding successful');
      res.json(response.data);
    } catch (error) {
      console.error('Error in encode endpoint:', error.message);
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({ 
          error: 'Python API is not available. Make sure Flask is running.' 
        });
      }
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({ error: 'Internal server error', details: error.message });
      }
    }
  });
});

// Decode endpoint
app.post('/api/decode', (req, res) => {
  const uploadHandler = upload.single('image');
  
  uploadHandler(req, res, async (err) => {
    // Handle multer errors
    if (err) {
      console.error('Upload error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File is too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(500).json({ error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      if (!req.body.password) {
        return res.status(400).json({ error: 'No password provided' });
      }

      console.log('Decoding - File received:', req.file.originalname, 'Size:', req.file.size);

      // Create form data to send to Python API
      const formData = new FormData();
      formData.append('image', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype
      });
      formData.append('password', req.body.password);

      // Forward request to Python API
      const response = await axios.post(`${PYTHON_API_URL}/decode`, formData, {
        headers: {
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 30000
      });

      console.log('Decoding successful');
      res.json(response.data);
    } catch (error) {
      console.error('Error in decode endpoint:', error.message);
      if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({ 
          error: 'Python API is not available. Make sure Flask is running.' 
        });
      }
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({ error: 'Internal server error', details: error.message });
      }
    }
  });
});

// Global error handler
app.use(multerErrorHandler);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Python API URL: ${PYTHON_API_URL}`);
});

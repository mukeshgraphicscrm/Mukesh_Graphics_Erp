const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();
const { initializeApp, cert } = require('firebase-admin/app');

// Initialize Firebase Admin (Only if env vars are present)
if (process.env.FIREBASE_PROJECT_ID) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin initialized successfully.');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
} else {
  console.warn('Firebase Admin not initialized: Missing FIREBASE_PROJECT_ID environment variable.');
}

const app = express();

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mukesh Graphics ERP API is running.' });
});

// Import routers
const createCrudRouter = require('./routes/crud');
const dashboardRouter = require('./routes/dashboard');

// Dashboard metrics
app.use('/api/dashboard', dashboardRouter);

// Set up static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, filename: req.file.originalname });
});

// Module CRUD routes
const collections = [
  'customers', 'leads', 'quotations', 'orders', 'products',
  'artworks', 'productionJobs', 'inventory', 'suppliers',
  'purchaseOrders', 'grn', 'dispatches', 'invoices'
];

collections.forEach(collection => {
  app.use(`/api/${collection}`, createCrudRouter(collection));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

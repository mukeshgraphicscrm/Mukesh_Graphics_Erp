const express = require('express');
const cors = require('cors');
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

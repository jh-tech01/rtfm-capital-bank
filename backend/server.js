const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const transactionRoutes = require('./routes/transactions');

// Load environment variables
dotenv.config();

// Check if MongoDB URI is defined
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error('ERROR: MONGODB_URI is not defined in .env file');
  console.error('Please create a .env file with MONGODB_URI=mongodb://localhost:27017/banking-app');
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB successfully');
  console.log('Database:', mongoURI);
})
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  console.error('Please make sure MongoDB is running');
  console.error('You can start MongoDB with: net start MongoDB (Windows) or mongod (Mac/Linux)');
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});
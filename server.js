const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require('./routes/auth');
const moduleRoutes = require('./routes/modules');
const opportunityRoutes = require('./routes/opportunities');

app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/opportunities', opportunityRoutes);

// Database connection
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI;

// Start server FIRST
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// Then connect to DB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err.message));
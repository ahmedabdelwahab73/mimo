const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const User = require('../models/User');
const langMiddleware = require('../middleware/lang');
const authMiddleware = require('../middleware/auth');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
	origin: '*',
	credentials: true
}));
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
	res.send('API is running...');
});

// Serve static files
app.use(express.static('public'));

// =============================================
// PUBLIC ROUTES
// =============================================
app.use('/api', langMiddleware);
app.use('/api/home', require('../routes/home/index'));
app.use('/api/auth', require('../routes/authRoutes'));
app.use('/api/comments', require('../routes/commentRoutes'));
app.use('/api/partners', require('../routes/partnerRoutes'));
app.use('/api/custom-packages', require('../routes/customPackageRoutes'));
app.use('/api/logos', require('../routes/logoRoutes'));
app.use('/api/custom-package-images', require('../routes/home/customPackageImageRoutes'));

// =============================================
// PROTECTED ROUTES
// =============================================
app.use('/api/dashboard', authMiddleware);
app.use('/api/dashboard/sliders', require('../routes/dashboard/sliderRoutes'));
app.use('/api/dashboard/comments', require('../routes/dashboard/commentRoutes'));
app.use('/api/dashboard/partners', require('../routes/dashboard/partnerRoutes'));
app.use('/api/dashboard/packages', require('../routes/dashboard/packageRoutes'));
app.use('/api/dashboard/logos', require('../routes/dashboard/logoRoutes'));
app.use('/api/dashboard/custom-package-images', require('../routes/dashboard/customPackageImageRoutes'));
app.use('/api/users', authMiddleware, require('../routes/userRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
	console.error('❌ Server Error:', err.message);
	res.status(err.status || 500).json({
		message: err.message || 'Internal Server Error',
		error: process.env.NODE_ENV === 'development' ? err : {}
	});
});

// =============================================
// MongoDB Connection
// =============================================
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
	.then(() => {
		console.log('✅ Connected to MongoDB successfully');
	})
	.catch((err) => {
		console.error('❌ MongoDB connection error:');
		console.error(err.message);
	});

// Export the app
module.exports = app;
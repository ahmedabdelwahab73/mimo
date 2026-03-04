const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const langMiddleware = require('./middleware/lang');
const authMiddleware = require('./middleware/auth');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
	origin: process.env.CORS_ORIGIN || '*',
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
app.use('/api/home', require('./routes/home/index'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/partners', require('./routes/partnerRoutes'));
app.use('/api/custom-packages', require('./routes/customPackageRoutes'));
app.use('/api/logos', require('./routes/logoRoutes'));
app.use('/api/custom-package-images', require('./routes/home/customPackageImageRoutes'));

// =============================================
// PROTECTED ROUTES
// =============================================
app.use('/api/dashboard', authMiddleware);
app.use('/api/dashboard/sliders', require('./routes/dashboard/sliderRoutes'));
app.use('/api/dashboard/comments', require('./routes/dashboard/commentRoutes'));
app.use('/api/dashboard/partners', require('./routes/dashboard/partnerRoutes'));
app.use('/api/dashboard/packages', require('./routes/dashboard/packageRoutes'));
app.use('/api/dashboard/logos', require('./routes/dashboard/logoRoutes'));
app.use('/api/dashboard/custom-package-images', require('./routes/dashboard/customPackageImageRoutes'));
app.use('/api/users', authMiddleware, require('./routes/userRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
	console.error('❌ Server Error:', err.message);
	res.status(err.status || 500).json({
		message: err.message || 'Internal Server Error',
		error: process.env.NODE_ENV === 'development' ? err : {}
	});
});

// =============================================
// MongoDB Connection & Default Admin Setup
// =============================================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Default admin configuration
const DEFAULT_ADMIN = {
	username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
	password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
	role: process.env.DEFAULT_ADMIN_ROLE || 'admin'
};

// Connect to MongoDB
mongoose.connect(MONGO_URI)
	.then(async () => {
		console.log('✅ Connected to MongoDB successfully');

		try {
			// Check if admin user already exists
			const adminExists = await User.findOne({
				username: DEFAULT_ADMIN.username
			});

			if (!adminExists) {
				// Check if any users exist
				const userCount = await User.countDocuments();

				if (userCount === 0) {
					console.log('📝 No users found. Creating default admin user...');

					// Create admin user
					const adminUser = new User({
						username: DEFAULT_ADMIN.username,
						password: DEFAULT_ADMIN.password,
						role: DEFAULT_ADMIN.role
					});

					await adminUser.save();

					// Test the password
					const testLogin = await adminUser.comparePassword(DEFAULT_ADMIN.password);

					console.log('\n🔐 ==========================================');
					console.log('✅ DEFAULT ADMIN CREATED SUCCESSFULLY!');
					console.log('==========================================');
					console.log(`📧 Username: ${DEFAULT_ADMIN.username}`);
					console.log(`🔑 Password: ${DEFAULT_ADMIN.password}`);
					console.log(`👤 Role: ${DEFAULT_ADMIN.role}`);
					console.log(`🔒 Password Working: ${testLogin ? '✅ Yes' : '❌ No'}`);
					console.log('⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!');
					console.log('==========================================\n');

				} else {
					console.log(`👥 Found ${userCount} users but no '${DEFAULT_ADMIN.username}'`);
				}
			} else {
				console.log(`✅ Admin user '${DEFAULT_ADMIN.username}' already exists`);
			}

		} catch (err) {
			console.error('❌ Error in admin setup:', err.message);
		}

		// Start server
		app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`);
			console.log(`📡 API: http://localhost:${PORT}/api`);
			console.log(`🔑 Login: http://localhost:${PORT}/api/auth/login`);
		});
	})
	.catch((err) => {
		console.error('❌ MongoDB connection error:');
		console.error(err.message);
		console.error('\n💡 Please check:');
		console.error('   1. Is MongoDB installed and running?');
		console.error('   2. Is MONGO_URI correct in .env file?');
		console.error('   3. Try: "mongosh" in terminal to test connection');
		process.exit(1);
	});
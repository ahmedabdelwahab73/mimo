const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const fixPassword = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log('Connected to MongoDB');

		const user = await User.findOne({ username: 'admin' });

		if (user) {
			console.log('User found. Hashing password...');
			// The pre-save hook in User.js will handle hashing when we save a plain string
			user.password = '123';
			await user.save();
			console.log('Password hashed successfully for user: admin');
		} else {
			console.log('User admin not found in dash-auth collection.');
		}

		process.exit(0);
	} catch (err) {
		console.error('Error:', err);
		process.exit(1);
	}
};

fixPassword();

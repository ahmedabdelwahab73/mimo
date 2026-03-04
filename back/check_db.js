const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
	.then(async () => {
		console.log('✅ Connected to MongoDB');

		// Define the model exactly as in your application
		const sliderSchema = new mongoose.Schema({
			image: String,
			sort: Number,
			active: Boolean,
		}, { collection: 'slider' }); // Explicitly forcing 'slider' collection

		const Slider = mongoose.model('Slider_Debug', sliderSchema);

		try {
			const count = await Slider.countDocuments();
			console.log(`📊 Total Documents in 'slider' collection: ${count}`);

			const docs = await Slider.find({});
			console.log('📄 Documents found:', JSON.stringify(docs, null, 2));

		} catch (err) {
			console.error('❌ Error querying database:', err);
		} finally {
			mongoose.connection.close();
		}
	})
	.catch((err) => {
		console.error('❌ MongoDB Connection Error:', err);
	});

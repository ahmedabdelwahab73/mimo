const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
	.then(async () => {
		console.log('✅ Connected to MongoDB');

		const db = mongoose.connection.db;
		const collection = db.collection('slider');

		try {
			const docs = await collection.find({}).toArray();
			console.log(`📊 Found ${docs.length} raw documents in 'slider' collection:`);
			console.log(JSON.stringify(docs, null, 2));

			// Check specifically for active documents
			const activeDocs = await collection.find({ active: true }).toArray();
			console.log(`✅ Active documents found: ${activeDocs.length}`);

		} catch (err) {
			console.error('❌ Error querying database:', err);
		} finally {
			mongoose.connection.close();
		}
	})
	.catch((err) => {
		console.error('❌ MongoDB Connection Error:', err);
	});

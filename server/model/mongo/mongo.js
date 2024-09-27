const mongoose = require('mongoose');

exports.connect = async (settings) => {
	try {
		const url = `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(
			process.env.DB_PASSWORD
		)}@crm-cluster.4rmifvq.mongodb.net/crm?retryWrites=true&w=majority`;
		await mongoose.connect(url);
		console.log('✅ Connected to Mongo');
	} catch (err) {
		console.error(err);
	}
};

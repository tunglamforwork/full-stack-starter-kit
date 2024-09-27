const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Cryptr = require('cryptr');
const crypto = new Cryptr(process.env.CRYPTO_SECRET);
const Schema = mongoose.Schema;

// define schema
const TaskSchema = new Schema({
	id: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	type: { type: String, required: true },
	scheduler: Date,
	date_created: Date,
});

const Task = mongoose.model('Task', TaskSchema, 'tasks');
exports.schema = Task;

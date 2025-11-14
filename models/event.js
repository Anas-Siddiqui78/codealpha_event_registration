const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },   // keep string for simplicity
  location: { type: String, required: true },
  seats: { type: Number, default: 0 },
  description: { type: String }
});

module.exports = mongoose.model('Event', eventSchema);

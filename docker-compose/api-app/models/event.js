const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventType: { type: String, required: true },
  timestamp: { type: Date, required: true },
  description: { type: String }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;

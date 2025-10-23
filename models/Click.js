const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  linkUrl: {
    type: String,
    required: true,
    enum: ['https://www.amazon.com', 'https://www.walmart.com']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userAgent: {
    type: String,
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  }
});

// index for better query performance
clickSchema.index({ linkUrl: 1, timestamp: -1 });

module.exports = mongoose.model('Click', clickSchema);

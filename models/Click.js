const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: ''
  },
  referrer: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: 'Unknown'
  },
  city: {
    type: String,
    default: 'Unknown'
  },
  // For tracking unique visitors
  visitorId: {
    type: String,
    index: true
  }
}, {
  timestamps: false
});

// Compound index for analytics queries
clickSchema.index({ shortCode: 1, timestamp: -1 });
clickSchema.index({ shortCode: 1, visitorId: 1 });

module.exports = mongoose.model('Click', clickSchema);

const validator = require('validator');

/**
 * Validate URL format
 */
const isValidUrl = (url) => {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
};

/**
 * Sanitize URL
 */
const sanitizeUrl = (url) => {
  return url.trim();
};

/**
 * Validate expiration date
 */
const isValidExpirationDate = (dateString) => {
  if (!dateString) return true; // Optional field
  
  const date = new Date(dateString);
  const now = new Date();
  
  return date instanceof Date && !isNaN(date) && date > now;
};

module.exports = {
  isValidUrl,
  sanitizeUrl,
  isValidExpirationDate
};

const crypto = require('crypto');

/**
 * Generate a unique visitor ID based on IP and User Agent
 */
const generateVisitorId = (ip, userAgent) => {
  const hash = crypto.createHash('sha256');
  hash.update(ip + userAgent);
  return hash.digest('hex');
};

/**
 * Get client IP address from request
 */
const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0].trim() ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         req.ip ||
         '0.0.0.0';
};

/**
 * Get geographic information from IP
 */
const getGeoInfo = (ip) => {
  const geoip = require('geoip-lite');
  const geo = geoip.lookup(ip);
  
  if (!geo) {
    return {
      country: 'Unknown',
      city: 'Unknown'
    };
  }
  
  return {
    country: geo.country || 'Unknown',
    city: geo.city || 'Unknown'
  };
};

module.exports = {
  generateVisitorId,
  getClientIp,
  getGeoInfo
};

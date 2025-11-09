const { customAlphabet } = require('nanoid');
const Url = require('../models/Url');

// Custom alphabet for short codes (alphanumeric)
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6);

/**
 * Generate a unique short code with collision detection
 */
const generateShortCode = async (maxAttempts = 5) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shortCode = nanoid();
    
    // Check for collision
    const existing = await Url.findOne({ shortCode });
    if (!existing) {
      return shortCode;
    }
    
    console.log(`⚠️ Collision detected for ${shortCode}, attempt ${attempt + 1}/${maxAttempts}`);
  }
  
  throw new Error('Failed to generate unique short code after maximum attempts');
};

/**
 * Validate custom alias
 */
const validateCustomAlias = (alias) => {
  const regex = /^[a-zA-Z0-9-_]{3,20}$/;
  return regex.test(alias);
};

/**
 * Check if custom alias is available
 */
const isAliasAvailable = async (alias) => {
  const existing = await Url.findOne({ 
    $or: [
      { shortCode: alias },
      { customAlias: alias }
    ]
  });
  return !existing;
};

module.exports = {
  generateShortCode,
  validateCustomAlias,
  isAliasAvailable
};

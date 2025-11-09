const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const Click = require('../models/Click');
const { generateVisitorId, getClientIp, getGeoInfo } = require('../utils/analytics');

/**
 * GET /:shortCode
 * Redirect to original URL and track analytics
 */
router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find URL
    const url = await Url.findOne({ shortCode, isActive: true });
    
    if (!url) {
      return res.status(404).sendFile(__dirname + '/../public/404.html');
    }

    // Check if expired
    if (url.isExpired()) {
      return res.status(410).sendFile(__dirname + '/../public/expired.html');
    }

    // Get visitor information
    const ip = getClientIp(req);
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers['referer'] || req.headers['referrer'] || '';
    const visitorId = generateVisitorId(ip, userAgent);
    const geoInfo = getGeoInfo(ip);

    // Record click analytics
    const click = new Click({
      shortCode,
      ipAddress: ip,
      userAgent,
      referrer,
      country: geoInfo.country,
      city: geoInfo.city,
      visitorId
    });

    // Save click and increment counter (non-blocking)
    Promise.all([
      click.save(),
      Url.updateOne({ shortCode }, { $inc: { clicks: 1 } })
    ]).catch(err => console.error('Error saving analytics:', err));

    // Redirect to original URL
    res.redirect(url.originalUrl);

  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;

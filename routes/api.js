const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const Click = require('../models/Click');
const { generateShortCode, validateCustomAlias, isAliasAvailable } = require('../utils/shortCodeGenerator');
const { isValidUrl, sanitizeUrl, isValidExpirationDate } = require('../utils/validators');
const { generateVisitorId, getClientIp, getGeoInfo } = require('../utils/analytics');
const { shortenLimiter } = require('../middleware/rateLimiter');
const QRCode = require('qrcode');

/**
 * POST /api/shorten
 * Create a shortened URL
 */
router.post('/shorten', shortenLimiter, async (req, res) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;

    // Validate original URL
    if (!originalUrl) {
      return res.status(400).json({ error: 'Original URL is required' });
    }

    const sanitizedUrl = sanitizeUrl(originalUrl);
    if (!isValidUrl(sanitizedUrl)) {
      return res.status(400).json({ error: 'Invalid URL format. Must include http:// or https://' });
    }

    // Validate expiration date if provided
    if (expiresAt && !isValidExpirationDate(expiresAt)) {
      return res.status(400).json({ error: 'Invalid expiration date. Must be in the future.' });
    }

    let shortCode;
    let finalCustomAlias = null;

    // Handle custom alias
    if (customAlias) {
      if (!validateCustomAlias(customAlias)) {
        return res.status(400).json({ 
          error: 'Invalid custom alias. Must be 3-20 characters, alphanumeric with hyphens or underscores.' 
        });
      }

      const available = await isAliasAvailable(customAlias);
      if (!available) {
        return res.status(409).json({ error: 'Custom alias already taken' });
      }

      shortCode = customAlias;
      finalCustomAlias = customAlias;
    } else {
      // Generate random short code with collision detection
      shortCode = await generateShortCode();
    }

    // Create URL document
    const url = new Url({
      originalUrl: sanitizedUrl,
      shortCode,
      customAlias: finalCustomAlias,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: getClientIp(req)
    });

    await url.save();

    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;

    res.status(201).json({
      success: true,
      data: {
        originalUrl: url.originalUrl,
        shortUrl,
        shortCode: url.shortCode,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/urls
 * Get all URLs (for dashboard)
 */
router.get('/urls', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const urls = await Url.find({ isActive: true })
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v')
      .lean();

    const count = await Url.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: urls.map(url => ({
        ...url,
        shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
        isExpired: url.expiresAt ? new Date() > url.expiresAt : false
      })),
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/:shortCode
 * Get analytics for a specific short URL
 */
router.get('/analytics/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const { days = 7 } = req.query;

    // Find URL
    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    // Get clicks
    const clicks = await Click.find({
      shortCode,
      timestamp: { $gte: daysAgo }
    }).lean();

    // Calculate unique visitors
    const uniqueVisitors = new Set(clicks.map(c => c.visitorId)).size;

    // Group by date
    const clicksByDate = clicks.reduce((acc, click) => {
      const date = click.timestamp.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Group by country
    const clicksByCountry = clicks.reduce((acc, click) => {
      acc[click.country] = (acc[click.country] || 0) + 1;
      return acc;
    }, {});

    // Recent clicks
    const recentClicks = clicks
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map(click => ({
        timestamp: click.timestamp,
        country: click.country,
        city: click.city,
        referrer: click.referrer || 'Direct'
      }));

    res.json({
      success: true,
      data: {
        url: {
          originalUrl: url.originalUrl,
          shortUrl: `${process.env.BASE_URL}/${url.shortCode}`,
          shortCode: url.shortCode,
          createdAt: url.createdAt,
          expiresAt: url.expiresAt,
          isExpired: url.isExpired()
        },
        analytics: {
          totalClicks: url.clicks,
          uniqueVisitors,
          clicksByDate,
          clicksByCountry,
          recentClicks
        }
      }
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/qr/:shortCode
 * Generate QR code for a short URL
 */
router.get('/qr/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Verify URL exists
    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    if (url.isExpired()) {
      return res.status(410).json({ error: 'This short URL has expired' });
    }

    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;

    // Generate QR code
    const qrCode = await QRCode.toDataURL(shortUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2
    });

    res.json({
      success: true,
      data: {
        qrCode,
        shortUrl
      }
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/urls/:shortCode
 * Delete a short URL (soft delete)
 */
router.delete('/urls/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode });
    if (!url) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    url.isActive = false;
    await url.save();

    res.json({
      success: true,
      message: 'Short URL deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

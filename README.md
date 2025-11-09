# 🔗 URL Shortener with Analytics

A complete, production-ready URL shortener service built with Node.js, Express, and MongoDB. Features include click tracking, geographic analytics, QR code generation, custom aliases, link expiration, and rate limiting.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D4.0-green.svg)

## ✨ Features

### Core Functionality
- ✅ **URL Shortening**: Convert long URLs into short, memorable links (6-8 character alphanumeric codes)
- ✅ **Custom Aliases**: Create personalized short links with custom names
- ✅ **Link Expiration**: Set expiration dates for temporary links
- ✅ **Collision Detection**: Automatic handling of duplicate short codes
- ✅ **QR Code Generation**: Generate scannable QR codes for any short link

### Analytics & Tracking
- 📊 **Click Tracking**: Monitor total clicks on each link
- 👥 **Unique Visitors**: Track unique visitors using IP + User Agent hashing
- 🌍 **Geographic Data**: See visitor locations by country and city
- 📈 **Time-Series Data**: View click trends over time
- 🔍 **Referrer Tracking**: Identify traffic sources

### Security & Performance
- 🔒 **Rate Limiting**: 10 requests per minute per IP for shortening (configurable)
- ✔️ **Input Validation**: Comprehensive URL and data validation
- 🛡️ **SQL Injection Protection**: MongoDB + Mongoose security
- ⚡ **Fast Redirects**: Optimized database queries with indexes

### User Interface
- 🎨 **Modern Dashboard**: Clean, responsive web interface
- 📱 **Mobile Friendly**: Works seamlessly on all devices
- 🔄 **Real-time Updates**: Instant refresh of statistics
- 📋 **One-Click Copy**: Easy link copying to clipboard

## 🏗️ Architecture

```
url-shortener-analytics/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   └── rateLimiter.js       # Rate limiting configuration
├── models/
│   ├── Url.js               # URL schema and methods
│   └── Click.js             # Click analytics schema
├── routes/
│   ├── api.js               # API endpoints
│   └── redirect.js          # Redirect handler
├── utils/
│   ├── shortCodeGenerator.js # Short code generation with collision detection
│   ├── validators.js         # Input validation helpers
│   └── analytics.js          # Analytics utilities
├── public/
│   ├── index.html           # Main dashboard
│   ├── 404.html             # 404 error page
│   ├── expired.html         # Expired link page
│   ├── css/
│   │   └── style.css        # Styling
│   └── js/
│       └── app.js           # Frontend JavaScript
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── server.js                # Main application
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (v4.0 or higher)
- **npm** or **yarn**

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd c:\Users\Ziad\Desktop\UPT\ATAD
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB**
   
   Make sure MongoDB is installed and running:
   ```bash
   # Windows (if installed as service)
   net start MongoDB
   
   # Or run manually
   mongod
   ```

4. **Configure environment variables**
   
   The `.env` file is already created. Update if needed:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/url-shortener
   BASE_URL=http://localhost:3000
   SHORT_CODE_LENGTH=6
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=10
   ```

5. **Start the application**
   ```bash
   # Production mode
   npm start
   
   # Development mode (with auto-reload)
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📖 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Shorten URL
```http
POST /api/shorten
Content-Type: application/json

{
  "originalUrl": "https://example.com/very/long/url",
  "customAlias": "my-link",        // Optional
  "expiresAt": "2024-12-31T23:59"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalUrl": "https://example.com/very/long/url",
    "shortUrl": "http://localhost:3000/my-link",
    "shortCode": "my-link",
    "expiresAt": "2024-12-31T23:59:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### 2. Get All URLs
```http
GET /api/urls?page=1&limit=10&sortBy=createdAt&order=desc
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5
  }
}
```

#### 3. Get Analytics
```http
GET /api/analytics/:shortCode?days=7
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": {
      "originalUrl": "https://example.com",
      "shortUrl": "http://localhost:3000/abc123",
      "shortCode": "abc123",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "analytics": {
      "totalClicks": 150,
      "uniqueVisitors": 87,
      "clicksByDate": {
        "2024-01-15": 45,
        "2024-01-16": 62
      },
      "clicksByCountry": {
        "US": 90,
        "UK": 35,
        "CA": 25
      },
      "recentClicks": [...]
    }
  }
}
```

#### 4. Generate QR Code
```http
GET /api/qr/:shortCode
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KG...",
    "shortUrl": "http://localhost:3000/abc123"
  }
}
```

#### 5. Delete URL
```http
DELETE /api/urls/:shortCode
```

**Response:**
```json
{
  "success": true,
  "message": "Short URL deleted successfully"
}
```

#### 6. Redirect (Access Short Link)
```http
GET /:shortCode
```

Redirects to the original URL and tracks analytics.

## 🎯 User Stories Implementation

### ✅ User Story 1: Paste URL and Get Short Link
Users can paste any long URL in the dashboard form and receive a shortened link immediately. The short code is randomly generated with collision detection.

### ✅ User Story 2: Customize Short Link
Users can provide a custom alias (3-20 characters) instead of using the random code. The system validates availability before creation.

### ✅ User Story 3: View Statistics
Comprehensive analytics dashboard shows:
- Total clicks and unique visitors
- Geographic breakdown by country/city
- Click trends over time
- Recent click history with timestamps

### ✅ User Story 4: Generate QR Code
Each short link can generate a QR code that can be scanned with mobile devices to access the URL directly.

### ✅ User Story 5: Set Expiration Date
Users can optionally set an expiration date for links. Expired links return a 410 status and show a custom expired page.

## 🔧 Technical Implementation

### Short Code Generation
- Uses `nanoid` library with custom alphanumeric alphabet
- 6-character codes = 56.8 billion possible combinations
- Maximum 5 retry attempts for collision resolution
- Indexed database queries for fast lookups

### Collision Detection
```javascript
// Pseudocode
1. Generate random short code
2. Check database for existing code
3. If collision detected, retry up to 5 times
4. If all retries fail, throw error
5. Otherwise, save new URL with unique code
```

### Rate Limiting
- Implemented using `express-rate-limit`
- 10 requests per minute for `/api/shorten`
- 60 requests per minute for general API
- Rate limiting by IP address
- Configurable via environment variables

### Analytics Tracking
- Every redirect is logged in the `Click` model
- Tracks: timestamp, IP, user agent, referrer, geo location
- Visitor ID = SHA256(IP + User Agent)
- Geo-location using `geoip-lite` library
- Aggregated queries for dashboard statistics

### Database Indexes
```javascript
// Url model
- shortCode: unique index
- customAlias: unique sparse index
- expiresAt: TTL index

// Click model
- shortCode + timestamp: compound index
- shortCode + visitorId: compound index
```

## 🛠️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/url-shortener |
| `BASE_URL` | Base URL for short links | http://localhost:3000 |
| `SHORT_CODE_LENGTH` | Length of generated codes | 6 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | 60000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 10 |

### Customization

**Change short code length:**
```javascript
// utils/shortCodeGenerator.js
const nanoid = customAlphabet('...', 8); // Change from 6 to 8
```

**Modify rate limits:**
```javascript
// middleware/rateLimiter.js
max: 20, // Increase from 10 to 20
```

**Adjust analytics retention:**
```javascript
// routes/api.js
const daysAgo = 30; // Change from 7 to 30 days
```

## 🧪 Testing

### Manual Testing

1. **Create a short URL:**
   - Go to http://localhost:3000
   - Paste a long URL
   - Click "Shorten URL"
   - Verify short link is created

2. **Test custom alias:**
   - Use the custom alias field
   - Try creating duplicate aliases (should fail)

3. **Test redirect:**
   - Click on a short URL
   - Verify it redirects correctly
   - Check analytics are recorded

4. **Test rate limiting:**
   - Make 11+ requests within 1 minute
   - Verify rate limit error appears

5. **Test QR code:**
   - Click "Generate QR Code"
   - Scan with mobile device
   - Verify it opens the correct URL

### API Testing with curl

```bash
# Create short URL
curl -X POST http://localhost:3000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl":"https://example.com"}'

# Get analytics
curl http://localhost:3000/api/analytics/abc123

# Generate QR code
curl http://localhost:3000/api/qr/abc123
```

## 🚀 Production Deployment

### Prerequisites for Production
- MongoDB Atlas or managed MongoDB instance
- Node.js hosting (Heroku, DigitalOcean, AWS, etc.)
- Domain name (optional)

### Steps

1. **Set production environment variables**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/urlshortener
   BASE_URL=https://yourdomain.com
   ```

2. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start server.js --name url-shortener
   pm2 startup
   pm2 save
   ```

3. **Set up reverse proxy (Nginx)**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable SSL with Let's Encrypt**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

## 📊 Performance Considerations

- **Database Indexing**: All frequently queried fields are indexed
- **Non-blocking Analytics**: Click recording doesn't block redirects
- **Connection Pooling**: Mongoose handles connection pooling automatically
- **Caching**: Consider adding Redis for frequently accessed URLs
- **CDN**: Serve static assets through CDN in production

## 🔒 Security Best Practices

✅ **Implemented:**
- Rate limiting on all endpoints
- Input validation and sanitization
- SQL injection protection (NoSQL)
- XSS protection via Content Security Policy
- CORS configuration

🔜 **Recommended Additions:**
- Authentication/Authorization for URL management
- CAPTCHA on shortening endpoint
- Malicious URL scanning
- HTTPS enforcement in production
- API key authentication

## 🐛 Troubleshooting

### MongoDB Connection Errors
```
Error: connect ECONNREFUSED
```
**Solution:** Make sure MongoDB is running
```bash
net start MongoDB
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Change port in `.env` or kill process using port 3000

### Rate Limit Issues
If rate limiting is too strict for development:
```javascript
// middleware/rateLimiter.js
max: 1000, // Increase temporarily
```

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using Node.js, Express, MongoDB, and modern web technologies.**

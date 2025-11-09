# 🚀 Quick Setup Guide

## Step 1: Install Prerequisites

### Install Node.js
1. Download Node.js from: https://nodejs.org/
2. Choose LTS version (Long Term Support)
3. Run the installer and follow the wizard
4. Verify installation by opening Command Prompt and running:
   ```
   node --version
   npm --version
   ```

### Install MongoDB
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Choose Windows version
3. Run installer with default settings
4. MongoDB will be installed as a Windows service and start automatically

## Step 2: Install Project Dependencies

Open Command Prompt in the project directory and run:
```bash
npm install
```

This will install all required packages:
- express (web framework)
- mongoose (MongoDB ODM)
- nanoid (short code generation)
- qrcode (QR code generation)
- express-rate-limit (rate limiting)
- geoip-lite (geolocation)
- validator (input validation)
- cors (CORS middleware)
- dotenv (environment variables)

## Step 3: Configure Environment

The `.env` file is already created with default settings:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/url-shortener
BASE_URL=http://localhost:3000
SHORT_CODE_LENGTH=6
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

## Step 4: Start MongoDB

MongoDB should start automatically as a Windows service. If not:
```bash
net start MongoDB
```

## Step 5: Run the Application

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

## Step 6: Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

## 🎯 What You Can Do Now

1. **Shorten a URL:**
   - Paste any long URL in the form
   - Optionally add a custom alias
   - Optionally set an expiration date
   - Click "Shorten URL"

2. **View All Links:**
   - Scroll down to see all your shortened URLs
   - See click statistics for each link

3. **Get Analytics:**
   - Click "Analytics" on any link
   - View total clicks, unique visitors
   - See geographic distribution
   - Check recent click history

4. **Generate QR Codes:**
   - Click "QR Code" on any link
   - Scan with mobile device to test

5. **Test API Endpoints:**
   - Use Postman or curl to test API
   - See README.md for full API documentation

## 🔧 Troubleshooting

### Problem: MongoDB not running
**Solution:**
```bash
net start MongoDB
```

### Problem: Port 3000 already in use
**Solution:** Edit `.env` and change PORT to another number (e.g., 3001)

### Problem: npm command not found
**Solution:** Node.js not installed or not in PATH. Reinstall Node.js.

### Problem: Cannot connect to MongoDB
**Solution:** Check MongoDB service is running in Windows Services

## 📚 Next Steps

1. Read the full README.md for detailed documentation
2. Explore the API endpoints with Postman
3. Customize the configuration in `.env`
4. Modify the frontend styling in `public/css/style.css`
5. Add authentication if needed

## 🎨 Project Structure

```
ATAD/
├── server.js              # Main application entry point
├── package.json           # Dependencies and scripts
├── .env                   # Configuration (do not commit)
├── config/
│   └── database.js        # MongoDB connection
├── models/
│   ├── Url.js            # URL model
│   └── Click.js          # Analytics model
├── routes/
│   ├── api.js            # API endpoints
│   └── redirect.js       # Redirect handler
├── middleware/
│   └── rateLimiter.js    # Rate limiting
├── utils/
│   ├── shortCodeGenerator.js
│   ├── validators.js
│   └── analytics.js
└── public/
    ├── index.html        # Dashboard
    ├── css/
    └── js/
```

## ✅ Features Checklist

- [x] URL shortening with random codes
- [x] Custom aliases
- [x] Link expiration
- [x] Collision detection (up to 5 retries)
- [x] Rate limiting (10 req/min for shortening)
- [x] Click tracking
- [x] Unique visitor tracking
- [x] Geographic analytics
- [x] QR code generation
- [x] Web dashboard
- [x] RESTful API
- [x] Mobile responsive design

## 🚀 Ready to Use!

Your URL shortener is now fully functional and ready for use. Start creating short links!
